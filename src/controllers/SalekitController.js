import { create_UUID } from '@/helpers/common'
import { verifyToken } from '@/helpers/token'
import { SalekitDocumentModel } from '@/models'
import { SalekitService } from '@/services'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import {
  createSalekitDocumentValidate,
  deleteSalekitDocumentValidate,
  updateSalekitDocumentValidate,
} from '@/validations'
import camelcaseKeys from 'camelcase-keys'
import * as dotenv from 'dotenv'
import log4js from 'log4js'
const logger = log4js.getLogger()

dotenv.config()

export default class SalekitController {
  constructor() {
    this.response = ResponseUtils
    this.salekitDocumentModel = SalekitDocumentModel
  }
  async create(req, res) {
    const {
      fileName,
      fileType,
      url,
      uploadType,
      originalDocumentId,
      version,
      languageId,
      documentTypeId,
      storageTypeId,
      domainId,
      subDomain,
      technologyUsed,
      languageDevelopment,
      hashtag,
      description,
      sharepointId,
    } = req.body

    const { error } = createSalekitDocumentValidate({
      fileName,
      uploadType,
      originalDocumentId,
      version,
      languageId,
      documentTypeId,
      storageTypeId,
      domainId,
      subDomain,
      technologyUsed,
      languageDevelopment,
      hashtag,
      description,
      sharepointId,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    try {
      const decode = verifyToken(req)
      const id = create_UUID()
      // Sử dụng map() để loại bỏ dấu # trong từng phần tử
      const newHashtag = hashtag?.map((item) => item.replace('#', ''))
      const payload = {
        id,
        file_name: fileName,
        file_type: fileType,
        url: url,
        upload_type: uploadType,
        original_document_id: uploadType === 1 ? originalDocumentId : id,
        version: version,
        language_id: languageId,
        document_type_id: documentTypeId,
        storage_type_id: storageTypeId,
        domain_id: domainId,
        sub_domain: subDomain,
        technology_used: technologyUsed,
        language_development: languageDevelopment,
        hashtag: newHashtag || [],
        description: description,
        sharepoint_id: sharepointId,
        created_by: decode?.username,
        updated_by: decode?.username,
      }
      const result = await SalekitService.create(payload).then(
        (res) => res.dataValues
      )

      const data = camelcaseKeys(result)
      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  //lấy danh sách tài liệu
  async get(req, res) {
    try {
      const result = await SalekitService.get(req)
      const data = {
        ...result?.data,
        salekitDocument: result?.data?.salekitDocument.map((item) =>
          camelcaseKeys(item)
        ),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  //cập nhật tài liệu
  async update(req, res) {
    const {
      id,
      fileName,
      uploadType,
      originalDocumentId,
      version,
      languageId,
      documentTypeId,
      storageTypeId,
      domainId,
      subDomain,
      technologyUsed,
      languageDevelopment,
      hashtag,
      description,
    } = req.body

    const { error } = updateSalekitDocumentValidate({
      id,
      fileName,
      uploadType,
      originalDocumentId,
      version,
      languageId,
      documentTypeId,
      storageTypeId,
      domainId,
      subDomain,
      technologyUsed,
      languageDevelopment,
      hashtag,
      description,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    try {
      const decode = verifyToken(req)
      // Sử dụng map() để loại bỏ dấu # trong từng phần tử
      const newHashtag = hashtag?.map((item) => item.replace('#', ''))
      const payload = {
        id,
        data: {
          file_name: fileName,
          upload_type: uploadType,
          original_document_id: uploadType === 1 ? originalDocumentId : id,
          version: version,
          language_id: languageId,
          document_type_id: documentTypeId,
          storage_type_id: storageTypeId,
          domain_id: domainId,
          sub_domain: subDomain,
          technology_used: technologyUsed,
          language_development: languageDevelopment,
          hashtag: newHashtag || [],
          description: description,
          updated_by: decode?.username,
        },
      }

      const result = await SalekitService.update(payload).then((res) => res)
      res
        .status(200)
        .json(
          this.response(
            200,
            !result?.dataValues ? result?.status?.code : Message.SUCCESS,
            null,
            !result?.dataValues
              ? result?.status?.statusMessage
              : camelcaseKeys(result?.dataValues)
          )
        )
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  //lấy chi tiết của tài liệu
  async getById(req, res) {
    const { id } = req.query
    const { error } = deleteSalekitDocumentValidate({
      id,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }
    try {
      const result = await SalekitService.getById(id)
      const data = camelcaseKeys(result)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  //xóa tài liệu
  async delete(req, res) {
    const { id } = req.body
    const { error } = deleteSalekitDocumentValidate({
      id,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }
    try {
      const result = await SalekitService.delete(id, req)
      res
        .status(result === 1 ? 200 : 400)
        .json(
          this.response(
            result === 1 ? 200 : result?.status?.message,
            result === 1 ? Message.SUCCESS : result?.status?.statusMessage,
            null
          )
        )
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    }
  }

  //lấy danh sách danh mục
  async getCategories(req, res) {
    try {
      const result = await SalekitService.getCategories()
      const documentType = result?.data?.filter((item) => item.type === 1)
      const storageType = result?.data?.filter((item) => item.type === 2)
      const domain = result?.data?.filter((item) => item.type === 3)
      const language = result?.data?.filter((item) => item.type === 4)

      const data = { documentType, storageType, domain, language }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }
  /* thống kê số lượng tài liệu theo từng mục 
  (loại tài liệu, loại lưu trữ, domain, language) */
  async getQuantityByType(req, res, next) {
    try {
      const result = await SalekitService.getQuantityByType(req)
      const data = camelcaseKeys(result)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }
  // get HistoryDocument
  async getHistoryDocument(req, res, next) {
    try {
      const { original_document_id } = req.query
      const result = await SalekitService.getHistoryDocument(
        original_document_id
      )

      const data = camelcaseKeys(result)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  // Lấy ra tài liệu nguồn type = 0
  async getDocumentResource(req, res) {
    const data = await SalekitService.getDocumentResource()
    res.status(200).json(this.response(200, Message.SUCCESS, null, data))
  }
}
