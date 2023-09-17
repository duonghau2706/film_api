import { create_UUID } from '@/helpers/common'
import { sequelize } from '@/helpers/connection'
import { element as elementPaginate } from '@/helpers/paginate'
import { CustomerResourceModel } from '@/models'
import { CustomerResourceRepositiory } from '@/repositories'
import DateUtils from '@/utils/DateUtils'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import * as dotenv from 'dotenv'

const { QueryTypes } = require('sequelize')
dotenv.config()

class CustomerResourceService {
  constructor() {
    this.result = ResponseUtils
    this.customerResourceModel = CustomerResourceModel
  }
  async create(payload) {
    try {
      const customerResource = await CustomerResourceRepositiory.create(payload)
      return customerResource
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
      const template = await CustomerResourceRepositiory.update(payload)
      return template
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DO_NOT_UPDATE,
      }
    }
  }

  async findById(id) {
    try {
      return await this.customerResourceModel
        .findOne({
          where: {
            id: id,
          },
        })
        .then((res) => res.dataValues)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.CUSTOMER_RESOURCE_NOT_FIND,
      }
    }
  }

  async deleteById(id) {
    try {
      const findData = await this.customerResourceModel.findOne({
        where: {
          id: id,
        },
      })
      if (!findData) {
        return this.result(false, 400, Message.CUSTOMER_RESOURCE_NOT_FIND, null)
      }

      return await CustomerResourceRepositiory.delete({ id }).then((res) => res)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.CUSTOMER_RESOURCE_NOT_FIND,
      }
    }
  }

  async get(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const name = req.query.name
      const field_name = req.query.fieldName

      let selectSql = 'SELECT c_r.*, COUNT(c.id) AS num_customers'
      let fromSql = ' FROM public.customer_resources as c_r'
      let leftJoin = ` LEFT JOIN public.customers as c on c."customer_resource_id"::uuid = c_r."id"::uuid`

      let bindParam = []
      let whereSql = ' WHERE 1 = 1 '

      if (name) {
        bindParam.push('%' + name + '%')
        whereSql += ` AND c_r.name ilike $${bindParam.length} `
      }

      if (field_name) {
        bindParam.push('%' + field_name + '%')
        whereSql += ` AND c_r.field_name ilike $${bindParam.length} `
      }

      let groupby = ' GROUP BY c_r.id'

      let orderBy = ` ORDER BY c_r.created_at DESC `

      let rawSql = selectSql + fromSql + leftJoin + whereSql + groupby + orderBy

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

        const customerResourceData = {
          customerResource: elements,
        }
        return this.result(200, true, Message.SUCCESS, customerResourceData)
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

      const customerResourceData = {
        customerResource: elements,
        paginate: {
          totalRecord,
          totalPage,
          size: +limitInput,
          page: +page,
        },
      }
      return this.result(200, true, Message.SUCCESS, customerResourceData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  //lấy danh sách khách hàng của nguồn
  async getCustomerOfResource(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const customerResourceId = req.query.customerResourceId
      const userId = req.query.userId
      const statusSend =
        req.query.statusSend === '0'
          ? 'Đã gửi'
          : req.query.statusSend === '1'
          ? 'Chưa gửi'
          : req.query.statusSend === '2'
          ? 'Gửi lỗi'
          : ''

      const startDate = req.query.startDate
        ? DateUtils.convertStartDateToStringFullTime(req.query.startDate)
        : null
      const endDate = req.query.endDate
        ? DateUtils.convertEndDateToStringFullTime(req.query.endDate)
        : null

      let selectSql = `SELECT * FROM (SELECT c.*,
        users.name as user_name,
        c_r.name as customer_resource,
        c.start_date,
        c.send_date,
        Case
            WHEN c.frequency_of_email IS NULL
            AND c.send_date IS NULL THEN 'Chưa gửi'
            WHEN c.frequency_of_email IS NULL
            AND c.send_date IS NOT NULL
            AND c.status = 0 THEN 'Đã gửi'
            WHEN c.frequency_of_email IS NULL
            AND c.send_date IS NOT NULL
            AND c.status = 2 THEN 'Gửi lỗi'
            WHEN c.frequency_of_email IS NOT NULL
            AND c.send_date IS NULL THEN 'Chưa gửi'
            WHEN c.frequency_of_email IS NOT NULL
            AND c.send_date <= c.start_date THEN 'Chưa gửi'
            WHEN c.frequency_of_email IS NOT NULL
            AND c.send_date > c.start_date
            AND c.status = 0 THEN 'Đã gửi'
            WHEN c.frequency_of_email IS NOT NULL
            AND c.send_date > c.start_date
            AND c.status = 2 THEN 'Gửi lỗi'
        END as status_send, `

      let countEmail = `( SELECT COUNT(m_h.id) AS sent_count
          from public.sent_mail_histories as m_h
          where m_h.customer_id = c.customer_id `

      let countFeedback = `(SELECT COUNT(
          DISTINCT CASE
              WHEN m_h.status_feedback = '1' THEN m_h.id
          END
      )  AS feedback_count  from
              public.sent_mail_histories as m_h
          where
              m_h.customer_id = c.customer_id `

      let fromSql = ` From ( select
      customer_id, 
      name,
      romaji_name,
      url,
      email,
      address,
      frequency_of_email,
      customer_resource_id,
      created_at,
      person_in_charge_id,
      send_date,
      status,
      (
          Current_date - (
              Case
                  WHEN frequency_of_email = '1' THEN 7
                  WHEN frequency_of_email = '2' THEN 30
                  WHEN frequency_of_email = '3' THEN 60
                  WHEN frequency_of_email = '4' THEN 90
                  WHEN frequency_of_email = '5' THEN 180
                  ELSE 0
              END
          )
      ) :: timestamp with time zone as start_date FROM (
        SELECT
            c.id AS customer_id,
            c.name,
            c.romaji_name,
            c.url,
            c.email,
            c.address,
            c.frequency_of_email,
            c.customer_resource_id,
            c.created_at,
            c.person_in_charge_id,
            m_h.send_date,
            m_h.status,
            ROW_NUMBER() OVER (
                PARTITION BY c.id
                ORDER BY
                    m_h.send_date DESC
            ) AS rn
        FROM
            public.customers as c
            LEFT JOIN public.sent_mail_histories as m_h ON c.id = m_h.customer_id
    ) as subquery
WHERE
    rn = 1
) as c`

      let leftJoin = ` 
      LEFT JOIN public.customer_resources as c_r on c.customer_resource_id = c_r.id
      LEFT JOIN public.users on c.person_in_charge_id = users.id `

      let bindParam = []
      let whereSql = ` WHERE css.customer_resource_id = '${customerResourceId}' `

      if (startDate) {
        bindParam.push(startDate)
        countEmail += ` AND m_h.send_date >= $${bindParam.length} `
        countFeedback += ` AND m_h.send_date >= $${bindParam.length} `
      }
      if (endDate) {
        bindParam.push(endDate)
        countEmail += ` AND m_h.send_date <= $${bindParam.length} `
        countFeedback += ` AND m_h.send_date <= $${bindParam.length} `
      }
      if (userId) {
        bindParam.push(userId)
        whereSql += ` AND css.person_in_charge_id = $${bindParam.length} `
      }
      if (statusSend) {
        bindParam.push(statusSend)
        whereSql += ` AND css.status_send = $${bindParam.length} `
      }

      countEmail += '),'
      countFeedback += ')'

      let groupby = ` GROUP BY c.customer_id, c.name, c.romaji_name, c.url, c.email, c.address, c.frequency_of_email, c.customer_resource_id,
      c.start_date, c_r.id, c.created_at, c.person_in_charge_id, users.name,c.send_date,
      c.status
      ORDER BY c.created_at DESC ) as css`

      let rawSql =
        selectSql +
        countEmail +
        countFeedback +
        fromSql +
        leftJoin +
        groupby +
        whereSql
      const result = await sequelize.query(rawSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      const totalSentCount = result?.reduce((accumulator, item) => {
        return accumulator + parseInt(item?.sent_count)
      }, 0)

      const totalResponseCount = result?.reduce((accumulator, item) => {
        return accumulator + parseInt(item?.feedback_count)
      }, 0)

      const totalRecord = result?.length
      const { totalPage, page, offset } = elementPaginate({
        totalRecord: result?.length,
        page: pageInput,
        limit: limitInput,
      })
      const elements = await sequelize.query(
        rawSql + ` LIMIT ${limitInput} OFFSET ${offset}`,
        { bind: bindParam, type: QueryTypes.SELECT }
      )

      const customerResourceData = {
        customerResource: {
          data: elements?.map((item) => {
            return { ...item, id: create_UUID() }
          }),
          total_sent_count: totalSentCount,
          total_response_count: totalResponseCount,
        },
        paginate: {
          totalRecord,
          totalPage,
          size: +limitInput,
          page: +page,
        },
      }
      return this.result(200, true, Message.SUCCESS, customerResourceData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  //lấy lịch sử gửi mail của nguồn
  async getHistorySendMail(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const customerResourceId = req.query.customerResourceId
      const customerId = req.query.customerId
      const statusResponse = req.query.statusResponse
      const startDate = req.query.startDate
        ? DateUtils.convertStartDateToStringFullTime(req.query.startDate)
        : null
      const endDate = req.query.endDate
        ? DateUtils.convertEndDateToStringFullTime(req.query.endDate)
        : null

      let selectSql = `SELECT c.id as customer_id, c.name, c.url, c.email, m_h.feedback_date, m_h.send_date, m_h.status_feedback, 
      m_h.user_id, c_r.name as customer_resource, users.name as user_name, m_h.status, m_h.template_id, m_h.pregnancy_status_sending,
      templates.template_name `

      let fromSql = ' FROM public.customers as c'
      let leftJoin = ` INNER JOIN public.sent_mail_histories as m_h on c."id"::uuid = m_h."customer_id"::uuid 
        LEFT JOIN public.customer_resources as c_r on c."customer_resource_id"::uuid = c_r."id"::uuid 
        LEFT JOIN PUBLIC.templates on m_h.template_id = templates.id 
        LEFT JOIN public.users on m_h."user_id"= users."id" `
      let bindParam = []
      let whereSql = ` WHERE c.customer_resource_id = '${customerResourceId}' AND c.id = '${customerId}' `

      if (statusResponse) {
        bindParam.push(statusResponse)
        whereSql += ` AND m_h.status_feedback = $${bindParam.length} `
      }

      if (startDate) {
        bindParam.push(startDate)
        whereSql += ` AND m_h.send_date >= $${bindParam.length} `
      }
      if (endDate) {
        bindParam.push(endDate)
        whereSql += ` AND m_h.send_date <= $${bindParam.length} `
      }

      let orderBy = ` ORDER BY m_h.send_date DESC `

      let rawSql = selectSql + fromSql + leftJoin + whereSql + orderBy

      const result = await sequelize.query(rawSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })
      const totalRecord = result.length
      const { totalPage, page, offset } = elementPaginate({
        totalRecord: result.length,
        page: pageInput,
        limit: limitInput,
      })
      const elements = await sequelize.query(
        rawSql + ` LIMIT ${limitInput} OFFSET ${offset}`,
        { bind: bindParam, type: QueryTypes.SELECT }
      )

      const customerResourceData = {
        customerResource: elements?.map((item) => {
          return { ...item, id: create_UUID() }
        }),
        paginate: {
          totalRecord,
          totalPage,
          size: +limitInput,
          page: +page,
        },
      }
      return this.result(200, true, Message.SUCCESS, customerResourceData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  //lấy danh sách khách hàng + số lượng khách hàng được gửi mail
  async getCustomerOfResourceSent(req, res) {
    try {
      const sendDate = req.query.sendDate
      const pregnancyStatusSending = req.query.pregnancyStatusSending
      let bindParam = []
      let bindParamCr = []

      let selectSql = `SELECT r.id, r.name, COUNT(h.id) as total_customer `

      let fromSql = ` FROM public.sent_mail_histories as h `

      let leftJoin = ` join public.customers as c on h.customer_id = c.id  
      join public.customer_resources as r on c.customer_resource_id = r.id `

      let where = `where h.send_date = '${sendDate}' AND h.pregnancy_status_sending = ${pregnancyStatusSending}`

      let groupby = ' GROUP BY r.id'

      let rawSql = selectSql + fromSql + leftJoin + where + groupby

      const result = await sequelize.query(rawSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      const selectCr = ` Select cr.id, cr.name from customer_resources as cr`

      const resultCr = await sequelize.query(selectCr, {
        bind: bindParamCr,
        type: QueryTypes.SELECT,
      })

      const mergedResult = resultCr?.map((c) => {
        const r = result?.find((r) => r?.id === c?.id)
        if (r) {
          return { id: r?.id, name: r?.name, total_customer: r?.total_customer }
        }
        return { id: c.id, name: c.name }
      })

      return this.result(200, true, Message.SUCCESS, mergedResult)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  //lấy danh sách khách hàng được import theo từng nguồn
  async getHistoryImportCustomer(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const startDate = req.query.startDate
        ? DateUtils.convertStartDateToStringFullTime(req.query.startDate)
        : null
      const endDate = req.query.endDate
        ? DateUtils.convertEndDateToStringFullTime(req.query.endDate)
        : null
      const customerResourceId = req.query.customerResourceId
      const createdBy = req.query.createdBy

      let bindParam = []

      let selectSql = `SELECT ich.id, ich.import_date, ich.customer_number, users.name as created_by`

      let fromSql = ` FROM public.import_customer_histories as ich `

      let leftJoin = ` left join users on ich.created_by = users.username `

      let where = `where ich.customer_resource_id = '${customerResourceId}' `

      let groupby =
        ' GROUP BY ich.id, ich.import_date, ich.customer_number, users.name '

      if (startDate) {
        bindParam.push(startDate)
        where += ` AND ich.import_date >= $${bindParam.length} `
      }
      if (endDate) {
        bindParam.push(endDate)
        where += ` AND ich.import_date <= $${bindParam.length} `
      }
      if (createdBy) {
        bindParam.push(createdBy)
        where += ` AND users.id = $${bindParam.length} `
      }

      let rawSql = selectSql + fromSql + leftJoin + where + groupby

      const result = await sequelize.query(rawSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      const totalRecord = result?.length

      if (!limitInput || !pageInput) {
        const elements = await sequelize.query(rawSql, {
          bind: bindParam,
          type: QueryTypes.SELECT,
        })

        const customerResourceData = {
          customerResource: elements,
        }
        return this.result(200, true, Message.SUCCESS, customerResourceData)
      }

      const { totalPage, page, offset } = elementPaginate({
        totalRecord: result?.length,
        page: pageInput,
        limit: limitInput,
      })
      const elements = await sequelize.query(
        rawSql + ` LIMIT ${limitInput} OFFSET ${offset}`,
        { bind: bindParam, type: QueryTypes.SELECT }
      )

      const customerResourceData = {
        customerResource: elements,

        paginate: {
          totalRecord,
          totalPage,
          size: +limitInput,
          page: +page,
        },
      }

      return this.result(200, true, Message.SUCCESS, customerResourceData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  //xem chi tiết khách hàng theo từng lần import
  async getDetailHistoryImportCustomer(req, res) {
    try {
      const importCustomerHistoriesId = req.query.importCustomerHistoriesId

      let bindParam = []

      let selectSql = `SELECT dt.*, cr.name as customer_resource_name from detail_import_customer_histories as dt LEFT JOIN customer_resources as cr on cr.id = dt.customer_resource_id
      where import_customer_histories_id = '${importCustomerHistoriesId}'`

      const result = await sequelize.query(selectSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      const customerResourceData = {
        customerResource: result,
      }

      return this.result(200, true, Message.SUCCESS, customerResourceData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }
}

export default new CustomerResourceService()
