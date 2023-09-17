import { sequelize } from '@/helpers/connection'
import { CustomerResourceModel } from '@/models'
import { default as CustomerResourceService } from '@/services/CustomerResourceService'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import {
  createCustomerResourceValidate,
  findByIdCustomerResourceValidate,
  updateCustomerResourceValidate,
} from '@/validations'
import camelcaseKeys from 'camelcase-keys'
import { QueryTypes } from 'sequelize'

export default class CustomerResourceController {
  constructor() {
    this.response = ResponseUtils
    this.customerResourceModel = CustomerResourceModel
  }
  async create(req, res) {
    const { name, fieldName, note, url, createdBy, updatedBy } = req.body

    const { error } = createCustomerResourceValidate({
      name,
      fieldName,
      note,
      url,
      createdBy,
      updatedBy,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    let bindParam = []
    let select = `SELECT * FROM customer_resources  `

    let whereSql = 'where name = '

    if (name) {
      bindParam.push(name)
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
        .json(this.response(400, Message.NAME_CUSTOMER_RESOURCE_EXISTS, null))
    }

    try {
      const bindParam = []
      let maxCode = null
      let newCode = ''

      //lấy danh sách code
      const selectCode = `SELECT code FROM customer_resources  `
      const resultCode = await sequelize.query(selectCode, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      // Tìm mã code lớn nhất trong mảng
      for (let i = 0; i < resultCode.length; i++) {
        const code = resultCode[i].code
        if (code !== null && (maxCode === null || code > maxCode)) {
          maxCode = code
        }
      }

      // Tăng mã code lớn nhất lên 1
      const codeNum = maxCode ? parseInt(maxCode.slice(1), 10) : 0 // Lấy số phía sau chữ cái 'S' và chuyển thành số nguyên
      const newCodeNum = codeNum + 1
      newCode = 'S' + newCodeNum.toString().padStart(4, '0') // Tạo mã code mới

      const payload = {
        name: name,
        field_name: fieldName ? fieldName : '',
        note: note,
        code: newCode,
        url: url,
        created_by: createdBy,
        updated_by: updatedBy,
      }

      const result = await CustomerResourceService.create(payload).then(
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
    const { id, name, fieldName, note, url, updatedBy } = req.body

    const { error } = updateCustomerResourceValidate({
      id,
      name,
      fieldName,
      note,
      url,
      updatedBy,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    const existedCustomerResource = await CustomerResourceService.findById(id)

    if (!existedCustomerResource) {
      throw {
        statusCode: 500,
        message: Message.CUSTOMER_RESOURCE_NOT_FIND,
      }
    }

    let bindParam = []
    let select = `SELECT * FROM customer_resources  `
    let whereSql = 'where name = '

    if (name) {
      bindParam.push(name)
      whereSql += `$${bindParam.length}`
    }

    whereSql += ` AND id <> '${existedCustomerResource?.id}'`

    const rawSql = select + whereSql

    const result = await sequelize.query(rawSql, {
      bind: bindParam,
      type: QueryTypes.SELECT,
    })

    if (result?.length > 0) {
      return res
        .status(400)
        .json(this.response(400, Message.NAME_CUSTOMER_RESOURCE_EXISTS, null))
    }

    try {
      const payload = {
        template: {
          name: name ? name : '',
          field_name: fieldName ? fieldName : undefined,
          note: note ? note : '',
          url: url ? url : '',
          updated_by: updatedBy ? updatedBy : '',
        },
        id,
      }

      const result = await CustomerResourceService.update(payload).then(
        (res) => res[0]
      )

      const data = camelcaseKeys(result)

      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, data?.dataValues))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async findById(req, res) {
    const { id } = req.query

    const { error } = findByIdCustomerResourceValidate({
      id,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    try {
      const result = await CustomerResourceService.findById(id)

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

    const { error } = findByIdCustomerResourceValidate({
      id,
    })

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    let bindParam = []
    let select = `SELECT * FROM customers where customer_resource_id = '${id}' `

    const result = await sequelize.query(select, {
      bind: bindParam,
      type: QueryTypes.SELECT,
    })

    if (result?.length > 0) {
      return res
        .status(400)
        .json(this.response(400, Message.CUSTOMER_RESOURCE_NOT_DELETE, null))
    }

    try {
      await CustomerResourceService.deleteById(id)

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
      const result = await CustomerResourceService.get(req)

      const data = {
        ...result.data,
        customerResource: camelcaseKeys(result.data.customerResource),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  //lấy danh sách khách hàng của nguồn
  async getCustomerOfResource(req, res) {
    try {
      const result = await CustomerResourceService.getCustomerOfResource(req)

      const newCustomer = camelcaseKeys(result?.data?.customerResource?.data)
      const totalSentCount = result?.data?.customerResource?.total_sent_count
      const totalResponseCount =
        result?.data?.customerResource?.total_response_count
      const data = {
        ...result.data,
        customerResource: {
          data: newCustomer,
          totalSentCount,
          totalResponseCount,
        },
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  //lấy lịch sử gửi mail của nguồn
  async getHistorySendMail(req, res) {
    try {
      const result = await CustomerResourceService.getHistorySendMail(req)

      const data = {
        ...result.data,
        customerResource: camelcaseKeys(result.data.customerResource),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  //lấy danh sách khách hàng + số lượng khách hàng được gửi
  async getCustomerOfResourceSent(req, res) {
    try {
      const result = await CustomerResourceService.getCustomerOfResourceSent(
        req
      )

      const customerResourceSent = camelcaseKeys(result?.data)

      const data = {
        customerResourceSent,
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  //lấy danh sách khách hàng được import theo từng nguồn
  async getHistoryImportCustomer(req, res) {
    try {
      const result = await CustomerResourceService.getHistoryImportCustomer(req)

      const customerResourceSent = camelcaseKeys(result?.data?.customerResource)

      const data = { customerResourceSent, paginate: result?.data?.paginate }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  //xem chi tiết khách hàng theo từng lần import
  async getDetailHistoryImportCustomer(req, res) {
    try {
      const result =
        await CustomerResourceService.getDetailHistoryImportCustomer(req)

      const customerResourceSent = camelcaseKeys(result?.data?.customerResource)

      const data = { customerResourceSent, paginate: result?.data?.paginate }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }
}
