import log4js from 'log4js'

import { sequelize } from '@/helpers/connection'
import { sendMail } from '@/helpers/email'
import {
  CodeSendMailHistoryModel,
  CustomerModel,
  SentMailHistoryModel,
  TemplateModel,
  UserModel,
} from '@/models'
import { templateLayoutPrimary } from '@/utils/template'
import * as dotenv from 'dotenv'
import { QueryTypes } from 'sequelize'
import snakecaseKeys from 'snakecase-keys'

import { element as elementPaginate } from '@/helpers/paginate'
import { SendMailHistoryRepository } from '@/repositories'
import DateUtils from '@/utils/DateUtils'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import camelcaseKeys from 'camelcase-keys'

import { create_UUID } from '@/helpers/common'
import { Op } from 'sequelize'

const schedule = require('node-schedule')

dotenv.config()

const SEND_EMAIL_STATUS = {
  PENDING: 1,
  FAILED: 2,
  SUCCESS: 0,
}

const PREGNACY_STATUS_SENDING = {
  MAIL: 1,
  INQUIRY: 2,
}

const logger = log4js.getLogger()
class SendMailService {
  constructor() {
    this.sentMailHistoryModel = SentMailHistoryModel
    this.templateModel = TemplateModel
    this.codeSendMailHistoryModel = CodeSendMailHistoryModel
    this.customerModel = CustomerModel
    this.userModel = UserModel
    this.result = ResponseUtils
  }
  async sendMulti(params, decode) {
    try {
      const currentDate = new Date()
      const formattedDate = currentDate.toISOString()
      const getTemplateName = await TemplateModel.findOne({
        where: {
          id: {
            [Op.in]: params.map((item) => item.templateId),
          },
        },
      }).then((res) => res?.dataValues)

      const dataCreate = params.map((item) => ({
        ...snakecaseKeys(item),
        created_by: decode.username,
        reason_send_mail:
          item.customerEmail === '' ? 'Không tồn tại email' : '',
        template_name: getTemplateName ? getTemplateName?.template_name : '',
        user_id: decode?.id,
        person_in_charge: decode.name,
        send_date: formattedDate,
        pregnancy_status_sending: PREGNACY_STATUS_SENDING.MAIL,
        status_feedback: '0',
        status:
          item.customerEmail === ''
            ? SEND_EMAIL_STATUS.FAILED
            : SEND_EMAIL_STATUS.PENDING,
      }))

      const dataCustomer = await this.sentMailHistoryModel.bulkCreate(
        dataCreate
      )

      const updateSendStatus = async (
        id,
        status
        // pregnancy_status_sending,
        // status_feedback
      ) =>
        await this.sentMailHistoryModel.update(
          {
            status,
            // pregnancy_status_sending,
            // status_feedback,
          },
          {
            where: {
              id,
            },
          }
        )

      const dataError = dataCustomer.filter(
        (item) => item.reason_send_mail !== ''
      )

      dataCustomer
        .filter((item) => item.reason_send_mail === '')
        .forEach((item, index) => {
          const startTime = new Date(Date.now() + 1000 * (index + 1))
          schedule.scheduleJob(startTime, async function (fireDate) {
            const template = await TemplateModel.findOne({
              where: {
                id: item.template_id,
              },
            }).then((res) => res?.dataValues)

            const data = {
              email: item.customer_email,
              subject: template.title,
              content: templateLayoutPrimary(
                template?.content,
                template?.styles
              ),
            }

            if (data.content.includes('{tenkhachhang}')) {
              data.content = data.content.replace(
                '{tenkhachhang}',
                item.customer_name
              )
            }

            logger.info(`send ${item.customer_email} start`)
            await sendMail(data)
              .then(async () => {
                logger.info(`send ${item.customer_email} success`)
                await updateSendStatus(
                  item.id,
                  SEND_EMAIL_STATUS.SUCCESS
                  // PREGNACY_STATUS_SENDING.MAIL,
                  // '0'
                )
              })
              .catch(async () => {
                logger.error(`send ${item.customer_email} failed`)
                await updateSendStatus(
                  item.id,
                  SEND_EMAIL_STATUS.FAILED
                  // PREGNACY_STATUS_SENDING.MAIL
                )
              })
          })
        })

      return {
        dataError:
          dataError?.length != 0
            ? dataError?.map((item) =>
                camelcaseKeys({
                  ...item.dataValues,
                })
              )
            : [],
        dataSuccess:
          dataCustomer?.length != 0
            ? dataCustomer
                .filter((item) => item.dataValues.reason_send_mail === '')
                .map((item) => camelcaseKeys(item.dataValues))
            : [],
      }
    } catch (error) {
      logger.error(`send mail customer err: ${error}`)
      throw error
    }
  }

  async findById(req) {
    try {
      const sendDate = req.query.sendDate
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const customerResourceId = req.query.customerResourceId

      let bindParam = []

      let selectSql = ` SELECT smh.id, smh.template_id, templates.template_name, customers.name as customer_name, customers.url, customers.email, 
      customer_resources.name as customers_resource_name, customer_resources.id as customers_resource_id, customers.id as customer_id,
      smh.status as status_sending, smh.reason_send_mail`
      let fromSql = ' FROM sent_mail_histories as smh '
      let leftJoin = ` LEFT JOIN templates on smh.template_id = templates.id
      lEFT JOIN customers on smh.customer_id = customers.id
      LEFT JOIN customer_resources on customers.customer_resource_id = customer_resources.id`

      let whereSql = ` WHERE smh.pregnancy_status_sending = 1 `

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

        const emailHistoryData = {
          emailHistory: elements,
          sendBy: elements?.[0]?.send_by,
          sendDate: elements?.[0]?.send_date,
          templateName: elements?.[0]?.template_name,
        }
        return this.result(200, true, Message.SUCCESS, emailHistoryData)
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

      const emailHistoryData = {
        emailHistory: newData,
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
      return this.result(200, true, Message.SUCCESS, emailHistoryData)
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

      let whereSql = ' WHERE smh.pregnancy_status_sending = 1 '
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

        const emailHistoryData = {
          emailHistory: elements,
        }
        return this.result(200, true, Message.SUCCESS, emailHistoryData)
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

      const emailHistoryData = {
        emailHistory: elements,
        paginate: {
          totalRecord,
          totalPage,
          size: limitInput,
          page,
        },
      }
      return this.result(200, true, Message.SUCCESS, emailHistoryData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  async update(params) {
    try {
      const payload = {
        data: params.data,
        option: { id: params.id },
      }
      const historyDataUpdate = await SendMailHistoryRepository.update(payload)

      return historyDataUpdate
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }
}

export default new SendMailService()
