import { sequelize } from '@/helpers/connection'
import { element as elementPaginate } from '@/helpers/paginate'
import { verifyToken } from '@/helpers/token'
import { SalekitDocumentModel } from '@/models'
import { SalekitRepository } from '@/repositories'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import * as dotenv from 'dotenv'

const { QueryTypes } = require('sequelize')
dotenv.config()

class SalekitService {
  constructor() {
    this.result = ResponseUtils
    this.salekitDocumentModel = SalekitDocumentModel
  }
  async create(payload) {
    try {
      const salekitDocument = await SalekitRepository.create(payload)
      return salekitDocument
    } catch (error) {
      if (error?.errors?.[0]?.message) {
        throw {
          statusCode: 400,
          message: error?.errors?.[0]?.message,
        }
      }
      if (error?.original?.routine)
        throw {
          statusCode: 400,
          message: Message.UUID,
        }
    }
  }

  async update(params) {
    try {
      const payload = {
        data: params.data,
        option: { id: params.id },
      }

      const salekitDocument = await SalekitRepository.update(payload)
      return salekitDocument?.[0]
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DO_NOT_UPDATE,
      }
    }
  }

  async delete(id, req) {
    const decode = verifyToken(req)
    try {
      const findData = await this.salekitDocumentModel.findOne({
        where: {
          id,
        },
      })

      let selectSql = `SELECT * from public.salekit_documents as skd WHERE skd.original_document_id = '${findData?.id}' and skd.id <> '${findData?.id}' `
      const result = await sequelize.query(selectSql, {
        type: QueryTypes.SELECT,
      })

      if (result?.length !== 0) {
        return this.result(
          false,
          400,
          Message.ORIGINAL_DOCUMENT_NOT_DELETE,
          null
        )
      }

      if (findData?.created_by !== decode?.username) {
        return this.result(false, 400, Message.ORIGINAL_DOCUMENT_AUTHEN, null)
      }

      return await SalekitRepository.delete({ id }).then((res) => res)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DOCUMENT_NOT_FIND,
      }
    }
  }

  async getById(id) {
    try {
      return await this.salekitDocumentModel
        .findOne({
          where: {
            id,
          },
        })
        .then((res) => res.dataValues)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DOCUMENT_NOT_FIND,
      }
    }
  }

  async getBySharePointId(id) {
    try {
      return await this.salekitDocumentModel
        .findOne({
          where: {
            sharepoint_id: id,
          },
        })
        .then((res) => res.dataValues)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DOCUMENT_NOT_FIND,
      }
    }
  }

  async get(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const searchAll = req.query.searchAll
      const file_name = req.query.fileName
      const technology_used = req.query.technologyUsed
      const language_development = req.query.languageDevelopment
      const description = req.query.description
      const document_type_id = req.query.documentTypeId
      const storage_type_id = req.query.storageTypeId
      const domain_id = req.query.domainId
      const hashtag = req.query.hashtag

      let selectSql = `SELECT skd.*, sc.name as storage_type_name, scd.name as domain_name, scdo.name as document_type_name , users.name
      from public.salekit_documents as skd
        join PUBLIC.salekit_categories as sc on skd.storage_type_id = sc.id
        join PUBLIC.salekit_categories as scd on skd.domain_id = scd.id
        join PUBLIC.salekit_categories as scdo on skd.document_type_id = scdo.id
        join PUBLIC.users on skd.updated_by = users.username`

      let bindParam = []
      let whereSql = ' WHERE 1 = 1 '

      if (searchAll) {
        bindParam.push(searchAll)
        whereSql += ` AND( skd.file_name ilike '%${searchAll}%' or skd.technology_used ilike '%${searchAll}%' or skd.language_development ilike '%${searchAll}%'
        or skd.description ilike '%${searchAll}%' or $${bindParam.length} = ANY(skd.hashtag) ) `
      }
      if (file_name) {
        bindParam.push('%' + file_name + '%')
        whereSql += ` AND skd.file_name ilike $${bindParam.length} `
      }
      if (technology_used) {
        bindParam.push('%' + technology_used + '%')
        whereSql += ` AND skd.technology_used ilike $${bindParam.length} `
      }
      if (language_development) {
        bindParam.push('%' + language_development + '%')
        whereSql += ` AND skd.language_development ilike $${bindParam.length} `
      }
      if (description) {
        bindParam.push('%' + description + '%')
        whereSql += ` AND skd.description ilike $${bindParam.length} `
      }
      if (document_type_id) {
        bindParam.push(document_type_id)
        whereSql += ` AND skd.document_type_id = $${bindParam.length} `
      }
      if (storage_type_id) {
        bindParam.push(storage_type_id)
        whereSql += ` AND skd.storage_type_id = $${bindParam.length} `
      }
      if (domain_id) {
        bindParam.push(domain_id)
        whereSql += ` AND skd.domain_id = $${bindParam.length} `
      }
      if (hashtag) {
        bindParam.push(hashtag)
        whereSql += ` AND $${bindParam.length} = ANY(skd.hashtag) `
      }

      let orderBy = ` ORDER BY skd.created_at DESC `

      let rawSql = selectSql + whereSql + orderBy

      const result = await sequelize.query(rawSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })
      const totalRecord = result.length

      if (!limitInput || !pageInput) {
        const elements = await sequelize.query(rawSql, {
          bind: bindParam,
          type: QueryTypes.SELECT,
        })

        const salekitDocumentData = {
          salekitDocument: elements,
        }
        return this.result(200, true, Message.SUCCESS, salekitDocumentData)
      }

      const { totalPage, page, offset } = elementPaginate({
        totalRecord: result.length,
        page: pageInput,
        limit: limitInput,
      })
      const elements = await sequelize.query(
        rawSql + ` LIMIT ${limitInput} OFFSET ${offset}`,
        { bind: bindParam, type: QueryTypes.SELECT }
      )

      const salekitDocumentData = {
        salekitDocument: elements,
        paginate: {
          totalRecord,
          totalPage,
          size: +limitInput,
          page: +page,
        },
      }
      return this.result(200, true, Message.SUCCESS, salekitDocumentData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  async getCategories() {
    try {
      let selectSql = `SELECT sc.id, sc.name, sc.type FROM salekit_categories as sc order by sc.created_at`
      const result = await sequelize.query(selectSql, {
        type: QueryTypes.SELECT,
      })
      return this.result(200, true, Message.SUCCESS, result)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DOCUMENT_NOT_FIND,
      }
    }
  }
  /* thống kê số lượng tài liệu theo từng mục 
  (loại tài liệu, loại lưu trữ, domain, language) */
  async getQuantityByType(req) {
    try {
      const searchAll = req.query.searchAll
      const file_name = req.query.fileName
      const technology_used = req.query.technologyUsed
      const language_development = req.query.languageDevelopment
      const description = req.query.description
      const document_type_id = req.query.documentTypeId
      const storage_type_id = req.query.storageTypeId
      const domain_id = req.query.domainId
      const hashtag = req.query.hashtag
      let selectSql = `
      SELECT c.id, c.name, c.type, COUNT(d.id) AS quantity
      FROM salekit_categories AS c
      LEFT JOIN salekit_documents AS d 
        ON ( c.type = 1 AND d.document_type_id = c.id )
        OR ( c.type = 2 AND d.storage_type_id = c.id )
        OR ( c.type = 3 AND d.domain_id = c.id ) `

      let bindParam = []
      let whereSql = ' WHERE 1 = 1 '

      if (searchAll) {
        bindParam.push(searchAll)
        whereSql += ` AND( d.file_name ilike '%${searchAll}%' or d.technology_used ilike '%${searchAll}%' or d.language_development ilike '%${searchAll}%'
        or d.description ilike '%${searchAll}%' or $${bindParam.length} = ANY(d.hashtag) ) `
      }
      if (file_name) {
        bindParam.push('%' + file_name + '%')
        whereSql += ` AND d.file_name ilike $${bindParam.length} `
      }
      if (technology_used) {
        bindParam.push('%' + technology_used + '%')
        whereSql += ` AND d.technology_used ilike $${bindParam.length} `
      }
      if (language_development) {
        bindParam.push('%' + language_development + '%')
        whereSql += ` AND d.language_development ilike $${bindParam.length} `
      }
      if (description) {
        bindParam.push('%' + description + '%')
        whereSql += ` AND d.description ilike $${bindParam.length} `
      }
      if (document_type_id) {
        bindParam.push(document_type_id)
        whereSql += ` AND d.document_type_id = $${bindParam.length} `
      }
      if (storage_type_id) {
        bindParam.push(storage_type_id)
        whereSql += ` AND d.storage_type_id = $${bindParam.length} `
      }
      if (domain_id) {
        bindParam.push(domain_id)
        whereSql += ` AND d.domain_id = $${bindParam.length} `
      }
      if (hashtag) {
        bindParam.push(hashtag)
        whereSql += ` AND $${bindParam.length} = ANY(d.hashtag) `
      }

      let groupBy = ` GROUP BY c.id, c.name, c.type`

      let rawSql1 = selectSql + whereSql + groupBy

      const result1 = await sequelize.query(rawSql1, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      let rawSql2 = `
      SELECT c.id, c.name, c.type, COUNT(d.id) AS quantity
      FROM salekit_categories AS c
      LEFT JOIN salekit_documents AS d
        ON ( c.type = 1 AND d.document_type_id = c.id )
        OR ( c.type = 2 AND d.storage_type_id = c.id )
        OR ( c.type = 3 AND d.domain_id = c.id )
      GROUP BY c.id, c.name, c.type`

      const result2 = await sequelize.query(rawSql2, {
        type: QueryTypes.SELECT,
      })

      // Khai báo mảng để lưu kết quả cuối cùng
      const mergedResults = []

      // Lặp qua result2
      result2.forEach((item2) => {
        // Tìm một bản ghi tương tự trong result1 (theo id)
        const matchingItem1 = result1?.find((item1) => item1?.id === item2?.id)

        // Nếu tìm thấy, thì lấy bản ghi từ result1, nếu không thì lấy bản ghi từ result2 với quantity = 0
        const finalItem = matchingItem1 || { ...item2, quantity: 0 }
        mergedResults.push(finalItem)
      })

      return mergedResults
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }
  // API get history document
  async getHistoryDocument(original_document_id, res) {
    try {
      let rawSql = `
      SELECT
        sd.file_name,
        sd.upload_type,
        sd.language_development,
        sd.version,
        sd.created_by,
        sd.url,
        sd.sharepoint_id,
        users.name as full_name,
        CASE
          WHEN sd.updated_by IS NULL THEN sd.created_by
          ELSE sd.updated_by
        END AS updated_by,
       sd.updated_at AS formatted_datetime,
        CASE
          WHEN sd.upload_type = 1 THEN CONCAT('sửa file', ' ', sd.file_name, ' bản ', case when c.name = 'Tiếng Việt' THEN 'VN' WHEN c.name = 'Tiếng Anh' THEN 'EN' WHEN c.name = 'Tiếng Nhật' THEN 'JP'     end)
          WHEN sd.upload_type = 0 THEN CONCAT('tạo file', ' ', sd.file_name, ' bản ', case when c.name = 'Tiếng Việt' THEN 'VN' WHEN c.name = 'Tiếng Anh' THEN 'EN' WHEN c.name = 'Tiếng Nhật' THEN 'JP'     end)
        END AS content,
        CASE
          WHEN c.name = 'Tiếng Việt' THEN 'VN'
          WHEN c.name = 'Tiếng Anh' THEN 'EN'    
          WHEN c.name = 'Tiếng Nhật' THEN 'JP'
        END AS language
      FROM
        salekit_documents AS sd
        JOIN salekit_categories AS c ON sd.language_id = c.id
        LEFT JOIN users on sd.created_by = users.username
      WHERE
        sd.original_document_id = '${original_document_id}'
      `
      const result = await sequelize.query(rawSql, {
        type: QueryTypes.SELECT,
      })
      return result
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }
  // api lấy ra tài liệu nguồn của theo điều kiện type= 0
  async getDocumentResource(req, res) {
    const sql = `
    SELECT *
    FROM salekit_documents
    where upload_type ='0'
    ;
    `
    const result = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    })
    return result
  }
}

export default new SalekitService()
