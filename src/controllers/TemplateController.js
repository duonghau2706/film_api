import { sequelize } from '@/helpers/connection'
import { verifyToken } from '@/helpers/token'
import { TemplateModel } from '@/models'
import { default as TemplateService } from '@/services/TemplateService'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import {
  createTemplateValidate,
  findByIdValidate,
  updateTemplateValidate,
} from '@/validations'
import camelcaseKeys from 'camelcase-keys'
import { QueryTypes } from 'sequelize'

export default class TemplateControler {
  constructor() {
    this.response = ResponseUtils
    this.templateModel = TemplateModel
  }
  async create(req, res) {
    const {
      templateName,
      title,
      content,
      styles,
      numberOfCharacters,
      note,
      createdBy,
      updatedBy,
    } = req.body

    const { error } = createTemplateValidate({
      templateName,
      title,
      content,
      styles,
      numberOfCharacters,
      note,
      createdBy,
      updatedBy,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    let bindParam = []
    let select = `SELECT * FROM templates  `
    let whereSql = 'where template_name = '

    if (templateName) {
      bindParam.push(templateName)
      whereSql += `$${bindParam.length}`
    }

    const rawSql = select + whereSql

    const result = await sequelize.query(rawSql, {
      bind: bindParam,
      type: QueryTypes.SELECT,
    })

    if (result?.length > 0) {
      return res
        .status(400)
        .json(this.response(400, Message.HEADER_TEMPLATE_EXISTS, null))
    }

    try {
      const payload = {
        template_name: templateName,
        content: content,
        title: title,
        styles: styles,
        number_of_characters: numberOfCharacters,
        note,
        created_by: createdBy,
        updated_by: updatedBy,
      }

      const result = await TemplateService.create(payload).then(
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

  async update(req, res) {
    const {
      id,
      templateName,
      title,
      content,
      styles,
      numberOfCharacters,
      note,
      updatedBy,
    } = req.body

    const { error } = updateTemplateValidate({
      id,
      templateName,
      title,
      content,
      styles,
      numberOfCharacters,
      note,
      updatedBy,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    const existedTemplate = await TemplateService.findById(id)

    if (!existedTemplate) {
      throw {
        statusCode: 500,
        message: Message.TEMPLATE_NOT_FIND,
      }
    }

    let bindParam = []
    let select = `SELECT * FROM templates  `
    let whereSql = 'where template_name = '

    if (templateName) {
      bindParam.push(templateName)
      whereSql += `$${bindParam.length}`
    }

    whereSql += ` AND id <> '${existedTemplate?.id}'`

    const rawSql = select + whereSql

    const result = await sequelize.query(rawSql, {
      bind: bindParam,
      type: QueryTypes.SELECT,
    })

    if (result?.length > 0) {
      return res
        .status(400)
        .json(this.response(400, Message.HEADER_TEMPLATE_EXISTS, null))
    }

    try {
      const payload = {
        template: {
          template_name: templateName ? templateName : '',
          title: title ? title : '',
          content: content ? content : '',
          styles: styles ? styles : '',
          number_of_characters: numberOfCharacters ? numberOfCharacters : 0,
          note: note ? note : '',
          updated_by: updatedBy ? updatedBy : '',
        },
        id,
      }

      const result = await TemplateService.update(payload).then((res) => res[0])

      const data = camelcaseKeys(result)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async findById(req, res) {
    const { id } = req.query

    const { error } = findByIdValidate({
      id,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    try {
      const result = await TemplateService.findById(id)

      const data = camelcaseKeys(result)
      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async deleteById(req, res) {
    const { id } = req.body

    const { error } = findByIdValidate({
      id,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    try {
      await TemplateService.deleteById(id)

      res.status(200).json(this.response(200, Message.SUCCESS, null, null))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async get(req, res) {
    try {
      const result = await TemplateService.get(req)

      const data = {
        ...result.data,
        template: camelcaseKeys(result.data.template),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  async changeStatus(req, res) {
    const decode = verifyToken(req)
    const { id, status } = req.body

    try {
      const payload = {
        template: {
          status,
          updated_by: decode?.username,
        },
        id,
      }

      const result = await TemplateService.update(payload).then((res) => res[0])

      const data = camelcaseKeys(result)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }
}
