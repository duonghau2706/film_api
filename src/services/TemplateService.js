import { sequelize } from '@/helpers/connection'
import { element as elementPaginate } from '@/helpers/paginate'
import { TemplateModel } from '@/models'
import { TemplateRepository } from '@/repositories'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import * as dotenv from 'dotenv'

const { Op, QueryTypes } = require('sequelize')
dotenv.config()

class TemplateService {
  constructor() {
    this.result = ResponseUtils
    this.templateModel = TemplateModel
  }
  async create(payload) {
    try {
      const template = await TemplateRepository.create(payload)
      return template
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DO_NOT_CREATE,
      }
    }
  }

  async update(params) {
    try {
      const payload = {
        data: params.template,
        option: { id: params.id },
      }
      const template = await TemplateRepository.update(payload)
      return template
    } catch (error) {
      console.error(error)
      throw {
        statusCode: 400,
        message: Message.DO_NOT_UPDATE,
      }
    }
  }

  async findById(id) {
    try {
      return await this.templateModel
        .findOne({
          where: {
            id: id,
          },
        })
        .then((res) => res.dataValues)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.TEMPLATE_NOT_FIND,
      }
    }
  }

  async deleteById(id) {
    try {
      const findData = await this.templateModel.findOne({
        where: {
          id: id,
        },
      })
      if (!findData) {
        return this.result(false, 400, Message.TEMPLATE_NOT_FIND, null)
      }

      return await TemplateRepository.delete({ id }).then((res) => res)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.TEMPLATE_NOT_FIND,
      }
    }
  }

  async get(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const template_name = req.query.templateName
      const title = req.query.title
      const status = req.query.status

      let selectSql = 'SELECT tp.*'
      let fromSql = ' FROM public.templates as tp '

      let bindParam = []
      let whereSql = ' WHERE 1 = 1 '

      if (template_name) {
        bindParam.push('%' + template_name + '%')
        whereSql += ` AND tp.template_name ilike $${bindParam.length} `
      }

      if (title) {
        bindParam.push('%' + title + '%')
        whereSql += ` AND tp.title ilike $${bindParam.length} `
      }

      if (status) {
        bindParam.push(status)
        whereSql += ` AND tp.status = $${bindParam.length} `
      }

      let orderBy = ` ORDER BY tp.created_at DESC `

      let rawSql = selectSql + fromSql + whereSql + orderBy

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

        const templateData = {
          template: elements,
        }
        return this.result(200, true, Message.SUCCESS, templateData)
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

      const templateData = {
        template: elements,
        paginate: {
          totalRecord,
          totalPage,
          size: limitInput,
          page,
        },
      }
      return this.result(200, true, Message.SUCCESS, templateData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }
}

export default new TemplateService()
