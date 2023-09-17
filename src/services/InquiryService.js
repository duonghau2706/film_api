import { create_UUID } from '@/helpers/common'
import { sequelize } from '@/helpers/connection'
import { element as elementPaginate } from '@/helpers/paginate'
import DateUtils from '@/utils/DateUtils'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import * as dotenv from 'dotenv'

const { QueryTypes } = require('sequelize')
dotenv.config()

class InquiryService {
  constructor() {
    this.result = ResponseUtils
  }

  async findById(req) {
    try {
      const sendDate = req.query.sendDate
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const customerResourceId = req.query.customerResourceId

      let bindParam = []

      let selectSql = ` SELECT  smh.id, smh.template_id, templates.template_name, customers.name as customer_name, customers.url, 
      customer_resources.name as customers_resource_name, customer_resources.id as customers_resource_id, customers.id as customer_id`
      let fromSql = ' FROM sent_mail_histories as smh '
      let leftJoin = ` LEFT JOIN templates on smh.template_id = templates.id
      lEFT JOIN customers on smh.customer_id = customers.id
      LEFT JOIN customer_resources on customers.customer_resource_id = customer_resources.id`

      let whereSql = ` WHERE smh.pregnancy_status_sending = 2 `

      if (sendDate) {
        bindParam.push(sendDate)
        whereSql += ` AND smh.send_date = $${bindParam.length} `
      }

      if (customerResourceId) {
        bindParam.push(customerResourceId)
        whereSql += ` AND customer_resources.id = $${bindParam.length} `
      }

      let rawSql = selectSql + fromSql + leftJoin + whereSql

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

        const inquiryHistoryData = {
          inquiryHistory: elements,
          sendBy: elements?.[0]?.send_by,
          sendDate: elements?.[0]?.send_date,
          templateName: elements?.[0]?.template_name,
        }
        return this.result(200, true, Message.SUCCESS, inquiryHistoryData)
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

      const newData = elements?.map((item) => {
        return { ...item, id: create_UUID() }
      })

      const inquiryHistoryData = {
        inquiryHistory: newData,
        sendBy: elements?.[0]?.send_by,
        sendDate: elements?.[0]?.send_date,
        templateName: elements?.[0]?.template_name,
        paginate: {
          totalRecord,
          totalPage,
          size: limitInput,
          page,
        },
      }
      return this.result(200, true, Message.SUCCESS, inquiryHistoryData)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.EMAIL_HISTORY_NOT_FIND,
      }
    }
  }

  async get(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const startDate = req.query.startDate
        ? DateUtils.convertStartDateToStringFullTime(req.query.startDate)
        : null
      const endDate = req.query.endDate
        ? DateUtils.convertEndDateToStringFullTime(req.query.endDate)
        : null
      const sendBy = req.query.sendBy
      const templateId = req.query.templateId

      let bindParam = []
      let selectSql = `SELECT smh.send_date, smh.template_id, count(smh.customer_id) as count_customer, 
      templates.template_name, smh.user_id, users.name as send_by, smh.pregnancy_status_sending`

      let fromSql = ' FROM sent_mail_histories as smh '
      let leftJoin = ` LEFT JOIN templates on templates.id = smh.template_id
      LEFT JOIN users on smh.user_id = users.id`

      let whereSql = ' WHERE smh.pregnancy_status_sending = 2 '
      const groupBy = ` GROUP BY smh.send_date, smh.user_id, template_id, templates.template_name, users.name, smh.pregnancy_status_sending`

      let orderBy = ` ORDER BY smh.send_date DESC `

      if (startDate) {
        bindParam.push(startDate)
        whereSql += ` AND smh.send_date >= $${bindParam.length} `
      }
      if (endDate) {
        bindParam.push(endDate)
        whereSql += ` AND smh.send_date <= $${bindParam.length} `
      }
      if (sendBy) {
        bindParam.push(sendBy)
        whereSql += ` AND smh.user_id = $${bindParam.length} `
      }
      if (templateId) {
        bindParam.push(templateId)
        whereSql += ` AND smh.template_id = $${bindParam.length} `
      }

      let rawSql = selectSql + fromSql + leftJoin + whereSql + groupBy + orderBy

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

        const inquiryHistoryData = {
          inquiryHistory: elements,
        }
        return this.result(200, true, Message.SUCCESS, inquiryHistoryData)
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

      const inquiryHistoryData = {
        inquiryHistory: elements,
        paginate: {
          totalRecord,
          totalPage,
          size: limitInput,
          page,
        },
      }
      return this.result(200, true, Message.SUCCESS, inquiryHistoryData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }
}

export default new InquiryService()
