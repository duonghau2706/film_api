import log4js from 'log4js'
import * as dotenv from 'dotenv'
import { CustomerService } from '@/services'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import { verifyToken } from '@/helpers/token'
import camelcaseKeys from 'camelcase-keys'
import { CustomerModel } from '@/models'
import {
  createCustomerByExcelValidate,
  asignCustomerByUser,
  updateFrequencyEmail,
  validateEmail,
} from '@/validations'
import { elasticsearchClient } from '@/server'

dotenv.config()
const logger = log4js.getLogger()

export default class CustomerController {
  constructor() {
    this.response = ResponseUtils
    this.customerModel = CustomerModel
  }
  async create(req, res, next) {
    const {
      name,
      romajiName,
      url,
      fieldName,
      address,
      email,
      customerResourceId,
      typeOfCustomer,
      frequencyOfEmail,
      personInChargeId,
      reason,
      size,
      type,
      revenue,
      investment,
      note,
      typeOfSend,
    } = req.body

    try {
      const decode = verifyToken(req)
      const payload = {
        name,
        field_name: fieldName,
        romaji_name: romajiName,
        url,
        address,
        email,
        type,
        size,
        revenue,
        investment,
        note,
        created_by: decode.username,
        customer_resource_id: customerResourceId,
        type_of_customer: typeOfCustomer,
        frequency_of_email: frequencyOfEmail,
        person_in_charge_id: personInChargeId,
        reason,
        type_of_send: typeOfSend,
      }
      const result = await CustomerService.create(payload).then(
        (res) => res.dataValues
      )

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

  async get(req, res, next) {
    const {
      currentPage,
      perPage,
      fieldName,
      size,
      type,
      revenue,
      investment,
      name,
      resourceId,
      typeCustomer,
      personInChargeId,
      reason,
      typeOfSend,
      url,
      address,
      statusSending,
    } = req.query
    try {
      const payload = {
        filter: {
          fieldName,
          size,
          type,
          revenue,
          investment,
          name,
          resourceId,
          typeCustomer,
          personInChargeId,
          reason,
          typeOfSend,
          url,
          address,
          statusSending,
        },
        paginate: {
          currentPage,
          perPage,
        },
      }

      const result = await CustomerService.get(payload)
      const data = {
        ...result,
        customers: result?.customers.map((item) => camelcaseKeys(item)),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async update(req, res, next) {
    const {
      id,
      name,
      romajiName,
      url,
      fieldName,
      address,
      email,
      size,
      type,
      revenue,
      investment,
      note,
      customerResourceId,
      typeOfCustomer,
      frequencyOfEmail,
      personInChargeId,
      reason,
      typeOfSend,
    } = req.body

    try {
      const decode = verifyToken(req)
      const payload = {
        id,
        data: {
          name,
          field_name: fieldName,
          romaji_name: romajiName,
          url,
          address,
          email,
          type,
          size,
          revenue,
          investment,
          note,
          updated_by: decode.username,
          customer_resource_id: customerResourceId,
          type_of_customer: typeOfCustomer,
          frequency_of_email: frequencyOfEmail,
          person_in_charge_id: personInChargeId,
          reason,
          type_of_send: typeOfSend,
        },
      }

      const result = await CustomerService.update(payload).then((res) => res[0])
      const data = camelcaseKeys(result.dataValues)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async getById(req, res, next) {
    const { id } = req.body
    try {
      const result = await CustomerService.getById({ id })
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

  async delete(req, res, next) {
    const { listId } = req.body

    try {
      await CustomerService.delete(listId)

      res.status(200).json(this.response(200, Message.SUCCESS, null))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    }
  }

  async createByExcel(req, res, next) {
    const { data } = req.body

    try {
      const newArr = data.map((item) => {
        const { error } = createCustomerByExcelValidate(item)
        return {
          ...item,
          errMsg: error?.message ? error.message : '',
        }
      })

      const decode = verifyToken(req)

      const result = await CustomerService.createByExcel(
        newArr.map((item) => ({
          ...item,
          oldId: item.id,
          typeOfSend: item.email ? 1 : 2,
        })),
        decode
      )

      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      res
        .status(error.status || 400)
        .json(
          this.response(error.status || 400, error.message, null, error?.data)
        )
    } finally {
    }
  }

  async checkListNameCustomerIsExist(req, res, next) {
    const { data } = req.body
    try {
      const result = await CustomerService.checkListNameCustomerIsExist(data)

      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.status || 400)
        .json(
          this.response(error.status || 400, error.message, null, error.data)
        )
    } finally {
    }
  }

  async asignCustomerByUser(req, res, next) {
    const { data } = req.body

    try {
      const { error } = asignCustomerByUser({ data })
      if (error) {
        throw {
          status: 400,
          message: error.message,
        }
      }
      const decode = verifyToken(req)

      const result = await CustomerService.asignCustomerByUser(data, decode)

      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.status || 400)
        .json(
          this.response(error.status || 400, error.message, null, error.data)
        )
    } finally {
    }
  }
  async updateFrequencyEmail(req, res, next) {
    const { data } = req.body

    try {
      const { error } = updateFrequencyEmail({ data })
      if (error) {
        throw {
          status: 400,
          message: error.message,
        }
      }
      const decode = verifyToken(req)

      const result = await CustomerService.updateFrequencyEmail(data, decode)

      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.status || 400)
        .json(
          this.response(error.status || 400, error.message, null, error.data)
        )
    } finally {
    }
  }

  async updateStatusSending(req, res, next) {
    const { data } = req.body

    try {
      const decode = verifyToken(req)

      const result = await CustomerService.updateStatusSending(data, decode)

      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.status || 400)
        .json(
          this.response(error.status || 400, error.message, null, error.data)
        )
    } finally {
    }
  }

  async getHistoybyEmail(req, res, next) {
    const {
      customerId,
      currentPage,
      perPage,
      dateFilter,
      userId,
      pregnancyStatusSending,
      statusFeedback,
    } = req.query
    try {
      const payload = {
        filter: {
          customerId,
          dateFilter,
          userId,
          pregnancyStatusSending,
          statusFeedback,
        },
        paginate: {
          currentPage,
          perPage,
        },
      }
      const result = await CustomerService.getlistHistorySendMailByEmai(payload)

      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  // Ánh xạ bảng thành chỉ mục Elasticsearch
  async mapTableToIndex(req, res, next) {
    try {
      // Lấy tất cả bản ghi từ bảng
      const customers = await this.customerModel.findAll()

      // Chuyển đổi bản ghi thành định dạng phù hợp với Elasticsearch
      const body = customers.flatMap((customer) => ({
        index: { _index: 'customers_index', _id: customer.id },
        address: customer.address,
        created_at: customer.created_at,
        created_by: customer.created_by,
        customer_resource_id: customer.customer_resource_id,
        email: customer.email,
        field_name: customer.field_name,
        frequency_of_email: customer.frequency_of_email,
        id: customer.id,
        investment: customer.investment,
        name: customer.name,
        note: customer.note,
        person_in_charge_id: customer.person_in_charge_id,
        reason: customer.reason,
        revenue: customer.revenue,
        romaji_name: customer.romaji_name,
        size: customer.size,
        type: customer.type,
        type_of_customer: customer.type_of_customer,
        type_of_send: customer.type_of_send,
        url: customer.url,
        user_id: customer.user_id,
        updated_at: customer.updated_at,
        updated_by: customer.updated_by,
      }))
      // await elasticsearchClient.indices.delete({ index: 'customers_index' })
      //  Gửi yêu cầu tạo chỉ mục Elasticsearch

      const chunkSize = 500 // Kích thước mỗi mảng con
      const dataCreated = []
      // Chia mảng thành các mảng con
      const chunks = body.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize)

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(item)
        return resultArray
      }, [])

      // for (let index = 0; index < chunks.length; index++) {
      //   const elementItem = chunks[index]

      //   const dataElacticsearh = await elasticsearchClient.bulk({
      //     refresh: true,
      //     body: elementItem,
      //   })

      //   const { items } = dataElacticsearh
      //   items.forEach((item) => {
      //     dataCreated.push(item)
      //   })
      // }

      for (let index = 0; index < chunks.length; index++) {
        const elementItem = chunks[index]
        for (
          let indexOfArray = 0;
          indexOfArray < elementItem.length;
          indexOfArray++
        ) {
          const element = elementItem[indexOfArray]
          const dataElasticsearch = await elasticsearchClient.index({
            index: 'customers_index',
            id: element.id,
            body: element,
          })

          dataCreated.push(dataElasticsearch)
        }
      }

      res
        .status(200)
        .json(
          this.response(
            200,
            Message.SUCCESS,
            null,
            dataCreated.length > 0 ? dataCreated : []
          )
        )
    } catch (error) {
      console.log(error)
      console.error('Lỗi khi ánh xạ dữ liệu:', error)
    }
  }

  async searchTitles(req, res, next) {
    const {
      currentPage,
      perPage,
      fieldName,
      size,
      type,
      revenue,
      investment,
      name,
      resourceId,
      typeCustomer,
      personInChargeId,
      reason,
      typeOfSend,
      url,
      address,
      statusSending,
    } = req.query
    try {
      const payload = {
        filter: {
          fieldName,
          size,
          type,
          revenue,
          investment,
          name,
          resourceId,
          typeCustomer,
          personInChargeId,
          reason,
          typeOfSend,
          url,
          address,
          statusSending,
        },
        paginate: {
          currentPage,
          perPage,
        },
      }

      const response = await CustomerService.searchByElacticsearch(payload)

      res.status(200).json(this.response(200, Message.SUCCESS, null, response))
    } catch (error) {
      logger.error(error.message)
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async configureMaxResultWindow(req, res, next) {
    try {
      // Lấy tất cả bản ghi từ bảng
      const { indexName, maxResultWindow } = req.query
      const response = await elasticsearchClient.indices.putSettings({
        index: indexName,
        body: {
          index: {
            max_result_window: maxResultWindow,
          },
        },
      })

      res.status(200).json(response)
    } catch (error) {}
  }

  async getAll(req, res) {
    try {
      const result = await CustomerService.getAllSql(req)
      const data = {
        ...result.data,
        customers: camelcaseKeys(result.data.customers),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }
}
