import { sequelize } from '@/helpers/connection'
import { cleanObj } from '@/helpers/obj'
import { element } from '@/helpers/paginate'
import {
  CustomerModel,
  CustomerResourceModel,
  DetailImportCustomerHistoriesModel,
  SentMailHistoryModel,
  TemplateModel,
  UserModel,
} from '@/models'
import {
  CustomerRepository,
  ImportCustomerHistoryRepository,
} from '@/repositories'
import { elasticsearchClient } from '@/server'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import camelcaseKeys from 'camelcase-keys'
import * as dotenv from 'dotenv'
import log4js from 'log4js'
import moment from 'moment'
import { Op } from 'sequelize'
import snakecaseKeys from 'snakecase-keys'

import { element as elementPaginate } from '@/helpers/paginate'
import { result } from 'lodash'
const Sequelize = require('sequelize')

const { QueryTypes } = require('sequelize')

/**
 * Để kiểm tra trùng domain mà không kiểm tra trùng path
 * @param {*} url1 : Dữ liệu url lấy từ trong database
 * @param {*} url2 : Dữ liệu url gửi lên từ front-end
 * @returns true : Bị Trùng , false : Không bị trùng
 */
const checkDuplicateDomain = (url1, url2) => {
  const domain1 = new URL(url1.endsWith('/') ? url1.slice(0, -1) : url1)
    .hostname
  const domain2 = new URL(url2.endsWith('/') ? url2.slice(0, -1) : url2)
    .hostname

  return domain1 === domain2
}

dotenv.config()

const logger = log4js.getLogger()
class CustomerService {
  constructor() {
    this.result = ResponseUtils
    this.customerModel = CustomerModel
    this.customerResourceModel = CustomerResourceModel
    this.userModel = UserModel
    this.sentMailHistory = SentMailHistoryModel
    this.templateModel = TemplateModel
    this.sentMailHistoryModel = SentMailHistoryModel
  }

  async get(params) {
    try {
      const { currentPage, perPage } = params.paginate

      const {
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
      } = params.filter

      const likeFilterValue = {
        name: name
          ? {
              [Op.iLike]: `%${name}%`,
            }
          : undefined,
        field_name: fieldName
          ? {
              [Op.iLike]: `%${fieldName}%`,
            }
          : undefined,
        url: url
          ? {
              [Op.iLike]: `%${url}%`,
            }
          : undefined,
        address: address
          ? {
              [Op.iLike]: `%${address}%`,
            }
          : undefined,
      }

      const listFildter = {
        revenue,
        investment,
        customer_resource_id: resourceId,
        reason,
        type_of_send: typeOfSend,
      }
      const filterValue = {
        where: {
          [Op.and]: [
            {
              ...cleanObj(listFildter),
              ...(params.filter.personInChargeId
                ? {
                    person_in_charge_id: personInChargeId
                      ? personInChargeId === '0'
                        ? null
                        : personInChargeId
                      : personInChargeId,
                  }
                : {}),
              ...(size
                ? {
                    size: size ? (size === '3' ? null : size) : size,
                  }
                : {}),
              ...(type
                ? {
                    type: type ? (type === '3' ? null : type) : type,
                  }
                : {}),
              ...(typeCustomer
                ? {
                    type_of_customer: typeCustomer
                      ? typeCustomer === '4'
                        ? null
                        : typeCustomer
                      : typeCustomer,
                  }
                : {}),
            },
          ],
          ...cleanObj(likeFilterValue),
        },
      }

      if (!currentPage && !perPage) {
        const customers = await this.customerModel.findAll({
          order: [['created_at', 'DESC']],
        })
        return {
          customers: customers.map((item) => item.dataValues),
        }
      }

      const offset = (currentPage - 1) * perPage

      const count = await this.customerModel.count({
        ...filterValue,
      })

      const { totalPage } = element({
        totalRecord: count,
        page: currentPage || 1,
        limit: perPage || 10,
      })

      const getAllData = await this.customerModel.findAll({
        ...filterValue,
        limit: perPage || 10,
        offset,
        order: [['created_at', 'DESC']],
      })

      const personInCharge = await this.userModel.findAll({
        where: {
          id:
            getAllData.length !== 0
              ? getAllData.map((item) => item.person_in_charge_id)
              : [],
        },
      })

      const customerResource = await this.customerResourceModel.findAll({
        where: {
          id:
            getAllData.length !== 0
              ? getAllData.map((item) => item.customer_resource_id)
              : [],
        },
      })

      const sentMailHistory = await this.sentMailHistory.findAll({
        where: {
          customer_id:
            getAllData.length !== 0 ? getAllData.map((item) => item.id) : [],
          send_date: {
            [Op.not]: null,
          },
        },
        order: [['send_date', 'DESC']],
      })

      const getpersonInCharge = (getAllData, personInCharge) => {
        return personInCharge.find(
          (item) => item.id === getAllData.person_in_charge_id
        )
      }

      const getCustomerResource = (getAllData, customerResource) => {
        return customerResource.find(
          (item) => item.id === getAllData.customer_resource_id
        )
      }

      const getNewSendDate = (getAllData, sentMailHistory) => {
        const sentMail = sentMailHistory.find((item) => {
          return item.customer_id === getAllData.id
        })
        return {
          send_date: sentMail?.dataValues?.send_date,
          status: sentMail?.dataValues?.status,
        }
      }

      const checkSendDateDuringFrequencyOfEmail = async (date, customer_id) => {
        return await this.sentMailHistoryModel.findAll({
          where: {
            send_date: {
              [Op.between]: [
                new moment(Date.now()).add(-1 * date, 'd'),
                new moment(Date.now()),
              ], // Lọc các email trong khoảng thời gian này
            },
            customer_id: customer_id,
          },
        })
      }

      const getStatusSending = async (
        frequency_of_email,
        near_send_date,
        customer_id,
        status_when_mail_send,
        item
      ) => {
        if (
          (frequency_of_email === null && !near_send_date) ||
          (frequency_of_email && !near_send_date)
        ) {
          return {
            ...item,
            status_sending: 'Chưa gửi',
          }
        }
        if (frequency_of_email === null && near_send_date) {
          return {
            ...item,
            status_sending: status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
          }
        }

        if (frequency_of_email) {
          if (
            frequency_of_email === '1' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                7,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '2' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                30,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '3' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                60,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '4' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                90,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '5' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                180,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          return {
            ...item,
            status_sending: 'Chưa gửi',
          }
        }
        return {
          ...item,
          status_sending: 'Chưa gửi',
        }
      }

      const dataCustomers = getAllData
        ?.map((item) => ({
          ...item.dataValues,
          person_in_Charge:
            personInCharge.length !== 0
              ? getpersonInCharge(item, personInCharge)?.name
              : null,
          customer_resource_name:
            customerResource.length !== 0
              ? getCustomerResource(item, customerResource)?.name
              : null,
          near_send_date:
            sentMailHistory.length !== 0
              ? getNewSendDate(item, sentMailHistory)?.send_date
              : null,
          status_when_mail_send:
            sentMailHistory.length !== 0
              ? getNewSendDate(item, sentMailHistory)?.status
              : null,
        }))
        .map(
          async (item) =>
            await getStatusSending(
              item.frequency_of_email,
              item.near_send_date,
              item.id,
              item.status_when_mail_send,
              item
            )
        )

      const data = await Promise.allSettled(dataCustomers).then((res) =>
        res.map((item) => item.value)
      )
      const dataFilter = []
      if (statusSending) {
        const getAllDatas = await this.customerModel.findAll({
          ...filterValue,
          order: [['created_at', 'DESC']],
        })

        const dataCustomerss = getAllDatas
          ?.map((item) => ({
            ...item.dataValues,
            person_in_Charge:
              personInCharge.length !== 0
                ? getpersonInCharge(item, personInCharge)?.name
                : null,
            customer_resource_name:
              customerResource.length !== 0
                ? getCustomerResource(item, customerResource)?.name
                : null,
            near_send_date:
              sentMailHistory.length !== 0
                ? getNewSendDate(item, sentMailHistory)?.send_date
                : null,
            status_when_mail_send:
              sentMailHistory.length !== 0
                ? getNewSendDate(item, sentMailHistory)?.status
                : null,
          }))
          .map(
            async (item) =>
              await getStatusSending(
                item.frequency_of_email,
                item.near_send_date,
                item.id,
                item.status_when_mail_send,
                item
              )
          )

        const datass = await Promise.allSettled(dataCustomerss).then((res) =>
          res.map((item) => item.value)
        )

        if (statusSending && statusSending === '1') {
          datass
            .filter((item) => item.status_sending === 'Đã gửi')
            .forEach((item) => {
              dataFilter.push(item)
            })
        }

        if (statusSending && statusSending === '2') {
          datass
            .filter((item) => item.status_sending === 'Chưa gửi')
            .forEach((item) => {
              dataFilter.push(item)
            })
        }

        if (statusSending && statusSending === '3') {
          datass
            .filter((item) => item.status_sending === 'Gửi lỗi')
            .forEach((item) => {
              dataFilter.push(item)
            })
        }
      }

      return {
        customers: statusSending
          ? dataFilter.slice(+offset, +offset + +perPage)
          : data,
        paginate: {
          totalRecord: statusSending ? dataFilter.length : count,
          totalPage,
          currentPage: +currentPage,
          perPage: +perPage,
        },
      }
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  async create(params) {
    try {
      const dataCreate = cleanObj(params)
      const checkIsExistName = await this.customerModel.findOne({
        where: {
          name: dataCreate?.name,
        },
      })

      /**
       * Kiểm tra url có gửi lên hay không
       */
      const checkIsExistUrl = dataCreate?.url
        ? await this.customerModel
            .findAll({
              attributes: ['url'],
              where: {
                url: {
                  [Op.iLike]: `%${dataCreate?.url.split('/')[2]}%`,
                },
              },
            })
            .then((res) => res.map((item) => item.url))
        : false

      const dataUrlDuplicate = checkIsExistUrl
        ? checkIsExistUrl
            .map((item) => checkDuplicateDomain(item, dataCreate.url))
            .some((item) => item === true)
        : false

      /**
       * Kiểm tra url gửi lên có tồn tại hay chưa
       */
      if (dataUrlDuplicate) {
        throw {
          statusCode: 400,
          message: `"Url" ${dataCreate.url} đã được sử dụng`,
        }
      }

      /**
       * Kiểm tra trùng tên, không trùng url
       */
      if (dataCreate?.url && checkIsExistName) {
        if (dataUrlDuplicate) {
          throw {
            statusCode: 400,
            message: `"Tên khách hàng" ${dataCreate.name} đã được sử dụng`,
          }
        }
        //Trùng tên khác url thành công
        const customers = await CustomerRepository.create(params)
        // const dataElasticsearch = await elasticsearchClient.index({
        //   index: 'customers',
        //   body: customers.dataValues,
        // })
        return customers
      }

      if (checkIsExistName) {
        throw {
          statusCode: 400,
          message: `"Tên khách hàng" ${dataCreate.name} đã được sử dụng`,
        }
      }

      const customers = await CustomerRepository.create(params)
      // const dataElasticsearch = await elasticsearchClient.index({
      //   index: 'customers',
      //   id: customers.dataValues.id,
      //   body: customers.dataValues,
      // })
      // console.log(dataElasticsearch)
      return customers
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
        data: cleanObj(params.data),
        option: { id: params.id },
      }
      const checkIsExistName = await this.customerModel.findOne({
        where: {
          name: payload.data?.name,
          [Op.not]: {
            id: payload.option.id,
          },
        },
      })
      /**
       * Kiểm tra url có gửi lên hay không
       */
      const checkIsExistUrl = payload.data?.url
        ? await this.customerModel
            .findAll({
              attributes: ['url'],
              where: {
                url: {
                  [Op.iLike]: `%${payload.data?.url.split('/')[2]}%`,
                },
                [Op.not]: {
                  id: payload.option.id,
                },
              },
            })
            .then((res) => res.map((item) => item.url))
        : false

      const dataUrlDuplicate =
        checkIsExistUrl.length > 0
          ? checkIsExistUrl
              .map((item) => checkDuplicateDomain(item, payload.data?.url))
              .some((item) => item === true)
          : false

      /**
       * Kiểm tra url gửi lên có tồn tại hay chưa
       */
      if (dataUrlDuplicate) {
        throw {
          statusCode: 400,
          message: `"Url" ${payload.data.url} đã được sử dụng`,
        }
      }

      /**
       * Kiểm tra trùng tên, không trùng url
       */
      if (payload.data?.url && checkIsExistName) {
        if (dataUrlDuplicate) {
          throw {
            statusCode: 400,
            message: `"Tên khách hàng" ${payload.data.name} đã được sử dụng`,
          }
        }
        //Trùng tên khác url thành công
        const customers = await CustomerRepository.update(payload)
        // await elasticsearchClient.update({
        //   index: 'customers',
        //   id: customers[0].dataValues.id,
        //   body: {
        //     doc: customers[0].dataValues,
        //   },
        // })
        return customers
      }

      if (checkIsExistName) {
        throw {
          statusCode: 400,
          message: `"Tên khách hàng" ${payload.data.name} đã được sử dụng`,
        }
      }

      const customers = await CustomerRepository.update(payload)

      // const body = listId.flatMap((id) => [
      //   { update: { _index: 'customers', _id: id } },
      // ])
      // await elasticsearchClient.bulk({ refresh: true, body })
      // const data = await elasticsearchClient.update({
      //   index: 'customers',
      //   id: customers[0].dataValues.id,
      //   body: {
      //     doc: customers[0].dataValues,
      //   },
      // })

      return customers
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  async delete(listId) {
    try {
      const customers = await this.customerModel.destroy({
        where: {
          id: {
            [Op.in]: listId,
          },
        },
      })

      if (customers) {
        // const body = listId.flatMap((id) => [
        //   { delete: { _index: 'customers', _id: id } },
        // ])
        // await elasticsearchClient.bulk({ refresh: true, body })

        await this.sentMailHistoryModel.destroy({
          where: {
            customer_id: {
              [Op.in]: listId,
            },
          },
        })
      }

      return customers
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  async getById(params) {
    try {
      const customer = await this.customerModel
        .findOne({
          where: {
            ...params,
          },
        })
        .then((res) => res?.dataValues)

      if (!customer) {
        throw {
          statusCode: 400,
          message: 'Không có data',
        }
      }

      // const response = await elasticsearchClient.get({
      //   index: 'customers',
      //   id: params?.id,
      // })

      const customerResource = await this.customerResourceModel.findOne({
        where: {
          id: customer.customer_resource_id,
        },
      })

      const personInCharge = await this.userModel.findOne({
        where: {
          id: customer.person_in_charge_id,
        },
      })

      // const customerResource = await this.customerResourceModel.findOne({
      //   where: {
      //     id: response?._source.customer_resource_id,
      //   },
      // })

      // const personInCharge = await this.userModel.findOne({
      //   where: {
      //     id: response?._source.person_in_charge_id,
      //   },
      // })

      return {
        ...customer,
        person_in_Charge: personInCharge?.name ? personInCharge?.name : null,
        customerResource_name: customerResource?.name
          ? customerResource?.name
          : null,
      }
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  async createByExcel(data, decode) {
    try {
      let dataExisted = {}
      const currentDate = new Date()

      const formattedDate = currentDate.toISOString()

      const checkCustomerResourceId = data.map((item) => {
        return {
          ...item,
          errMsg:
            !item?.customerResourceId && item?.errMsg
              ? 'Nguồn khách hàng không tồn tại hoặc trống'
              : item?.errMsg,
        }
      })

      const existedUrl = async (url) =>
        await this.customerModel
          .findAll({
            where: {
              url: {
                [Op.iLike]: `%${url.split('/')[2]}%`,
              },
            },
          })
          .then((res) => {
            const data = res?.find(
              (item) =>
                item?.dataValues?.url.split('/')[2] === url.split('/')[2]
            )
            dataExisted = data
            return data
          })

      const existedName = async (name) =>
        await this.customerModel
          .findOne({
            where: {
              name,
            },
          })
          .then((res) => res?.dataValues)

      const createCustomer = async (data) =>
        await this.customerModel.create(data)

      const bulkCreateData = checkCustomerResourceId.filter((item) => {
        return !item.errMsg
      })
      const chunkSize = 500 // Kích thước mỗi mảng con
      const created = []
      const createFailed = []
      const dataImport = []

      // Chia mảng thành các mảng con
      const chunks = bulkCreateData.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize)

        if (!resultArray[chunkIndex]) {
          resultArray[chunkIndex] = [] // start a new chunk
        }

        resultArray[chunkIndex].push(item)
        return resultArray
      }, [])

      for (let index = 0; index < chunks.length; index++) {
        const elementItem = chunks[index]
        for (
          let indexOfArray = 0;
          indexOfArray < elementItem.length;
          indexOfArray++
        ) {
          const element = elementItem[indexOfArray]

          if (element?.url && (await existedUrl(element.url))) {
            const newElement = { ...snakecaseKeys(element) }
            delete newElement.id
            delete newElement.name
            delete newElement.url
            delete newElement.customer_resource_id

            const payload = {
              data: newElement,
              option: { id: dataExisted?.id },
            }
            const dataAdd = {
              ...snakecaseKeys(element),
              created_by: decode?.username,
            }
            delete dataAdd.id
            delete dataAdd.err_msg
            delete dataAdd.old_id
            delete dataAdd.type_of_send

            dataImport.push(dataAdd)

            //cập nhật lại dữ liệu trong bảng customer
            const customer = await CustomerRepository.update(payload)

            // cập nhật lại dữ liệu trong elasticsearch
            // const dataUpdateElasticsearch = await elasticsearchClient.update({
            //   index: 'customers',
            //   id: customer[0].dataValues.id,
            //   body: {
            //     doc: customer[0].dataValues,
            //   },
            // })

            created.push({
              ...camelcaseKeys(customer?.[0]?.dataValues),
              oldId: element.oldId,
            })
            continue
          }
          if (!element?.url && (await existedName(element?.name))) {
            created.push({ ...element, errMsg: 'Tên khách hàng đã tồn tại' })
            continue
          }

          if (element.typeOfCustomer !== '2' && element?.reason) {
            created.push({
              ...element,
              errMsg: 'Lý do chỉ có khi phân loại khách hàng là Blacklist',
            })
            continue
          }

          const oldId = element.oldId

          delete element.id
          delete element.oldId

          const dataAdd = {
            ...snakecaseKeys(element),
            created_by: decode.username,
          }
          delete dataAdd.id
          delete dataAdd.err_msg
          delete dataAdd.old_id
          delete dataAdd.type_of_send

          dataImport.push(dataAdd)

          const customer = await createCustomer({
            ...snakecaseKeys(element),
            created_by: decode.username,
          }).then((res) => ({
            ...camelcaseKeys(res.dataValues),
            oldId,
          }))

          // const dataElasticsearch = await elasticsearchClient.index({
          //   index: 'customers',
          //   id: customer.id,
          //   body: snakecaseKeys(customer),
          // })

          created.push(customer)
        }
      }

      const newDataImport = {
        import_date: formattedDate,
        customer_number: dataImport?.length,
        created_by: decode.username,
        customer_resource_id: dataImport?.[0]?.customer_resource_id,
      }

      //lưu vào bảng lịch sử import customer
      const res = await ImportCustomerHistoryRepository.create(newDataImport)

      const newDataAdd = dataImport?.map((data) => {
        return {
          ...data,
          import_customer_histories_id: res?.id,
        }
      })

      //lưu vào bảng chi tiết lịch sử import customer
      await DetailImportCustomerHistoriesModel.bulkCreate(newDataAdd)

      const newData = [
        ...checkCustomerResourceId.filter((item) => {
          return item.errMsg
        }),
        ...created,
        ...createFailed,
      ]

      return newData
    } catch (error) {
      throw error
    }
  }

  async checkListNameCustomerIsExist(data) {
    try {
      const existedName = async (name) =>
        await this.customerModel
          .findOne({
            where: {
              name,
            },
          })
          .then((res) => res?.dataValues)

      // const created = []
      for (let index = 0; index < data.length; index++) {
        const element = data[index]

        if (element?.name && (await existedName(element.name))) {
          element.errMsg = 'Tên khách hàng đã tồn tại'
        } else element.errMsg = 'Không trùng'
      }
      return {
        dataCheckExinsted: data ? data : [],
      }
    } catch (error) {
      throw error
    }
  }

  async asignCustomerByUser(data, decode) {
    try {
      const existedId = await this.customerModel
        .findAll({
          where: {
            id: {
              [Op.in]: data.map((item) => item.id),
            },
          },
        })
        .then((res) => res.map((item) => item?.id))

      if (existedId.length !== data.length) {
        const dataIdNotExist = data
          .filter((item) => !existedId.includes(item?.id))
          .map((item) => item.name)
        throw {
          status: 400,
          message: 'Lỗi customer không tồn tại',
          data: dataIdNotExist,
        }
      }

      const dataUpdate = data.map((item) => {
        return snakecaseKeys({
          ...item,
          updatedBy: decode.username,
        })
      })

      const result = await this.customerModel.update(
        {
          default: true,
          person_in_charge_id: dataUpdate[0].person_in_charge_id,
          updated_by: dataUpdate[0].updated_by,
        },

        {
          where: {
            id: {
              [Op.in]: existedId,
            },
            // transaction,
          },
        }
      )

      // if (result && result.length > 0) {
      //   const body = dataUpdate.flatMap((customer) => [
      //     { update: { _index: 'customers', _id: customer.id } },
      //     { doc: { ...customer } },
      //   ])

      //   await elasticsearchClient.bulk({
      //     refresh: true,
      //     body,
      //   })
      // }

      const dataUpdateSucess = await this.customerModel
        .findAll({
          where: {
            id: {
              [Op.in]: dataUpdate.map((item) => item.id),
            },
          },
        })
        .then((res) => res.map((item) => item.dataValues))
      return {
        dataAssign: result
          ? dataUpdateSucess.map((item) => camelcaseKeys(item))
          : [],
      }
    } catch (error) {
      throw error
    }
  }

  async updateFrequencyEmail(data, decode) {
    try {
      const existedId = await this.customerModel
        .findAll({
          where: {
            id: {
              [Op.in]: data.map((item) => item.id),
            },
          },
        })
        .then((res) => res.map((item) => item?.id))

      if (existedId.length !== data.length) {
        const dataIdNotExist = data
          .filter((item) => !existedId.includes(item?.id))
          .map((item) => item.name)
        throw {
          status: 400,
          message: 'Lỗi customer không tồn tại',
          data: dataIdNotExist,
        }
      }

      const dataUpdate = data.map((item) => {
        return snakecaseKeys({
          ...item,
          updatedBy: decode.username,
        })
      })

      const result = await this.customerModel.update(
        {
          default: true,
          frequency_of_email: dataUpdate[0].frequency_of_email,
          updated_by: dataUpdate[0].updated_by,
        },

        {
          where: {
            id: {
              [Op.in]: existedId,
            },
            // transaction,
          },
        }
      )

      // if (result && result.length > 0) {
      //   const body = dataUpdate.flatMap((customer) => [
      //     { update: { _index: 'customers', _id: customer.id } },
      //     { doc: customer },
      //   ])

      //   await elasticsearchClient.bulk({
      //     refresh: true,
      //     body,
      //   })
      // }

      const dataUpdateSucess = await this.customerModel
        .findAll({
          where: {
            id: {
              [Op.in]: dataUpdate.map((item) => item.id),
            },
          },
        })
        .then((res) => res.map((item) => item.dataValues))
      return {
        dataUpdateFrequencyEmail: result
          ? dataUpdateSucess.map((item) => camelcaseKeys(item))
          : [],
      }
    } catch (error) {
      throw error
    }
  }

  async updateStatusSending(data, decode) {
    try {
      // Lấy một mảng các customer_id

      const existedId = await this.customerModel
        .findAll({
          where: {
            id: {
              [Op.in]: data.map((item) => item.customerId),
            },
          },
        })
        .then((res) => res.map((item) => item?.id))

      if (existedId.length !== data.length) {
        const dataIdNotExist = data
          .filter((item) => !existedId.includes(item?.id))
          .map((item) => item.name)
        throw {
          status: 400,
          message: 'Lỗi customer không tồn tại',
          data: dataIdNotExist,
        }
      }

      if (!data[0]?.pregnancyStatusSending) {
        const latestSentDates = await this.sentMailHistory.findAll({
          attributes: [
            'customer_id',
            [
              Sequelize.fn('max', Sequelize.col('send_date')),
              'latest_sent_date',
            ],
          ],
          where: { customer_id: existedId },
          group: ['customer_id'],
        })

        let res = []
        for (let itemUpdate of latestSentDates) {
          const result = await this.sentMailHistory.update(
            {
              default: true,
              feedback_date: data[0].feedbackDate,
              updated_by: decode.username,
              status_feedback: data[0].statusFeedback,
            },

            {
              where: {
                customer_id: itemUpdate?.dataValues.customer_id,
                send_date: itemUpdate?.dataValues.latest_sent_date,
              },
            }
          )
          res.push(result)
        }

        return {
          dataUpdateSucess: res.length > 0 ? res : [],
        }
      }

      const getTemplateName = await this.templateModel.findOne({
        where: {
          id: data[0]?.templateId,
        },
      })

      const dataUpdateHistory = await this.sentMailHistory.bulkCreate(
        data.map((item) => {
          return snakecaseKeys({
            ...item,
            updatedBy: decode.username,
            template_name: getTemplateName
              ? getTemplateName?.template_name
              : null,
          })
        })
      )
      return {
        dataUpdateSucess: dataUpdateHistory
          ? dataUpdateHistory.map((item) => camelcaseKeys(item.dataValues))
          : [],
      }
    } catch (error) {
      throw error
    }
  }
  async getlistHistorySendMailByEmai(params) {
    const { currentPage, perPage } = params.paginate

    const {
      customerId,
      dateFilter,
      userId,
      pregnancyStatusSending,
      statusFeedback,
    } = params.filter

    const listFildter = {
      // customer_id: customerId,
      send_date: dateFilter
        ? { [Op.between]: [dateFilter[0], dateFilter[1]] }
        : null,
      user_id: userId,
      pregnancy_status_sending: pregnancyStatusSending,
      status_feedback: statusFeedback,
    }

    const dataHistory = await this.sentMailHistory.findAll({
      where: {
        customer_id: customerId,
      },
      order: [['created_at', 'DESC']],
    })

    const data =
      dataHistory.length !== 0
        ? dataHistory.filter(
            (item) =>
              item.dataValues.pregnancy_status_sending === 1 ||
              item.dataValues.pregnancy_status_sending === 2
          )
        : // .map((item) => camelcaseKeys(item.dataValues))
          []

    if (!currentPage && !perPage) {
      return {
        detailHistorySendMail:
          data.length !== 0
            ? data.map((item) => camelcaseKeys(item.dataValues))
            : [],
      }
    }

    const offset = (currentPage - 1) * perPage

    const count = await this.sentMailHistory.count({
      where: {
        [Op.and]: [cleanObj(listFildter)],
        customer_id: customerId,
      },
    })

    const { totalPage } = element({
      totalRecord: count,
      page: +currentPage || 1,
      limit: +perPage || 10,
    })

    const dataHistoryMail = await this.sentMailHistory.findAll({
      where: {
        [Op.and]: [cleanObj(listFildter)],
        customer_id: customerId,
      },
      order: [['created_at', 'DESC']],
      limit: perPage || 10,
      offset,
    })

    const listUserId = await this.userModel.findAll({
      where: {
        id: {
          [Op.in]: dataHistoryMail.map((el) => el.user_id),
        },
      },
    })

    return {
      detailHistorySendMail:
        dataHistoryMail.length > 0
          ? dataHistoryMail.map((item) =>
              camelcaseKeys({
                ...item.dataValues,
                person_in_Charge: listUserId.find((e) => e.id === item.user_id)
                  ?.name,
              })
            )
          : [],
      paginate: {
        totalRecord: count,
        totalPage,
        currentPage: +currentPage,
        perPage: +perPage,
      },
    }
  }

  async searchByElacticsearh(params) {
    try {
      const { currentPage, perPage } = params.paginate

      const {
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
      } = params.filter

      //** Hàm xử lý khi không truyền currentPage và Perpage */
      if (!currentPage && !perPage) {
        //** Hàm tính  tổng số lượng bản ghi*/
        const dataCount = await elasticsearchClient.count({
          index: 'customers',
          body: {
            query: {
              match_all: {},
            },
          },
        })

        const results = await elasticsearchClient.search({
          index: 'customers',
          body: {
            query: {
              match_all: {},
            },
            size: dataCount?.count,
            from: 0,
          },
        })
        console.log('results.hits', results.hits)
        const { hits } = results.hits

        return {
          customers:
            hits.length > 0
              ? hits.map((hit) => camelcaseKeys(hit._source))
              : [],
        }
      }

      const offset = (currentPage - 1) * perPage

      //** Mảng chứa các giá trị tìm kiếm */
      const query = {
        bool: {
          must: [],
          must_not: [],
        },
      }
      if (fieldName) {
        query.bool.must.push({
          match_phrase_prefix: { field_name: `*${fieldName}*` },
        })
      }

      if (size) {
        size === '3'
          ? query.bool.must_not.push({
              exists: {
                field: 'size',
              },
            })
          : query.bool.must.push({ match: { type } })
      }

      if (type) {
        type === '3'
          ? query.bool.must_not.push({
              exists: {
                field: 'type',
              },
            })
          : query.bool.must.push({ match: { type } })
      }

      if (revenue) {
        query.bool.must.push({ match: { revenue } })
      }

      if (investment) {
        query.bool.must.push({
          match_phrase_prefix: { investment: investment },
        })
      }

      if (name) {
        query.bool.must.push({
          match_phrase: { name: `*${name}*` },
        })
      }
      if (resourceId) {
        query.bool.must.push({ match: { customer_resource_id: resourceId } })
      }

      if (typeCustomer) {
        typeCustomer === '4'
          ? query.bool.must_not.push({
              exists: {
                field: 'type_of_customer',
              },
            })
          : query.bool.must.push({ match: { type_of_customer: typeCustomer } })
      }

      if (personInChargeId === '0' || personInChargeId) {
        personInChargeId === '0'
          ? query.bool.must_not.push({
              exists: {
                field: 'person_in_charge_id',
              },
            })
          : query.bool.must.push({
              match: {
                person_in_charge_id: personInChargeId,
              },
            })
      }

      if (reason) {
        query.bool.must.push({ match: { reason: `*${reason}*` } })
      }

      if (typeOfSend) {
        query.bool.must.push({ match: { type_of_send: typeOfSend } })
      }

      if (url) {
        query.bool.must.push({ match_phrase_prefix: { url: `*${url}*` } })
      }
      if (address) {
        query.bool.must.push({ match: { address: `*${address}*` } })
      }

      //** Hàm tính  tổng số lượng bản ghi*/
      const dataCount = await elasticsearchClient.count({
        index: 'customers',
        body: {
          query: {
            match_all: {},
          },
        },
      })

      //** Hàm tính  tổng số lượng bản ghi*/
      const datalength = await elasticsearchClient.count({
        index: 'customers',
        body: {
          query:
            query.bool.must.length > 0 || query.bool.must_not.length > 0
              ? query
              : {
                  match_all: {},
                },
        },
      })

      await elasticsearchClient.indices.putSettings({
        index: 'customers',
        body: {
          index: {
            max_result_window: +dataCount.count + 10000,
          },
        },
      })

      //** Hàm xử lý khi gọi dữ liệu từ ElasticSearch */
      const results = await elasticsearchClient.search({
        index: 'customers',
        body: {
          query:
            query.bool.must.length > 0 || query.bool.must_not.length > 0
              ? query
              : {
                  match_all: {},
                },
          from: offset,
          size: perPage || 10,
          sort: [{ created_at: { order: 'desc' } }],
          profile: true,
        },
      })
      const { hits, total } = results.hits

      //** Hàm xử lý id từ bảng user có trong dữ liệu từ ElasticSearch (lưu ý : person_in_charge_id (id người phụ trách) )*/
      const personInCharge = await this.userModel.findAll({
        where: {
          id:
            hits.length !== 0
              ? hits.map((item) => item._source.person_in_charge_id)
              : [],
        },
      })

      //** Hàm xử lý id từ bảng customerResource có trong dữ liệu từ ElasticSearch */
      const customerResource = await this.customerResourceModel.findAll({
        where: {
          id:
            hits.length !== 0
              ? hits.map((item) => item._source.customer_resource_id)
              : [],
        },
      })

      //** Hàm xử lý lấy ra tất cả lịch sử gửi theo id của customer sắp xếp giảm dần theo ngày gửi */

      const sentMailHistory = await this.sentMailHistory.findAll({
        where: {
          customer_id:
            hits.length !== 0 ? hits.map((item) => item._source.id) : [],
          send_date: {
            [Op.not]: null,
          },
        },
        order: [['send_date', 'DESC']],
      })

      const getpersonInCharge = (customers, personInCharge) => {
        return personInCharge.find(
          (item) => item.id === customers.person_in_charge_id
        )
      }

      const getCustomerResource = (customers, customerResource) => {
        return customerResource.find(
          (item) => item.id === customers.customer_resource_id
        )
      }

      const getNewSendDate = (customers, sentMailHistory) => {
        const sentMail = sentMailHistory.find((item) => {
          return item.customer_id === customers.id
        })
        return {
          send_date: sentMail?.dataValues?.send_date,
          status: sentMail?.dataValues?.status,
        }
      }

      /**
       *
       * @param {*} date : Dựa theo tần suất gửi mail ( 1 tuần = 7 ngày ,....)
       * @param {*} customer_id : id của từng khách hàng
       * @returns : Trả về một mảng các giá trị
       */
      const checkSendDateDuringFrequencyOfEmail = async (date, customer_id) => {
        return await this.sentMailHistoryModel.findAll({
          where: {
            send_date: {
              [Op.between]: [
                new moment(Date.now()).add(-1 * date, 'd'),
                new moment(Date.now()),
              ], // Lọc các email trong khoảng thời gian này
            },
            customer_id: customer_id,
          },
        })
      }
      /**
       *
       * @param {*} frequency_of_email : Tần suất gửi mail
       * @param {*} near_send_date  : Ngày gửi gần nhất
       * @param {*} customer_id : id của khách hàng
       * @param {*} item : object từ bảng customer => Trạng thái gửi(status_sending) : Đã gửi và Chưa gửi
       * @returns
       */
      const getStatusSending = async (
        frequency_of_email,
        near_send_date,
        customer_id,
        status_when_mail_send,
        item
      ) => {
        if (
          (frequency_of_email === null && !near_send_date) ||
          (frequency_of_email && !near_send_date)
        ) {
          return {
            ...item,
            status_sending: 'Chưa gửi',
          }
          // return 'Đã gửi'
        }
        if (frequency_of_email === null && near_send_date) {
          return {
            ...item,
            status_sending: status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
          }
          // return 'Đã gửi'
        }

        if (frequency_of_email) {
          if (
            frequency_of_email === '1' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                7,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '2' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                30,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '3' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                60,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '4' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                90,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          if (
            frequency_of_email === '5' &&
            (
              await checkSendDateDuringFrequencyOfEmail(
                180,

                customer_id
              )
            ).length > 0
          ) {
            return {
              ...item,
              status_sending:
                status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
            }
          }
          return {
            ...item,
            status_sending: 'Chưa gửi',
          }
        }
        return {
          ...item,
          status_sending: 'Chưa gửi',
        }
      }
      /**
       * Mảng thu được sau khi lấy được dữ liêu sau khi kiểm tra các hàm trên
       */
      const dataCustomers = hits
        ?.map((item) => {
          console.log(item)
          return {
            ...item._source,
            person_in_Charge:
              personInCharge.length !== 0
                ? getpersonInCharge(item._source, personInCharge)?.name
                : null,
            customer_resource_name:
              customerResource.length !== 0
                ? getCustomerResource(item._source, customerResource)?.name
                : null,
            near_send_date:
              sentMailHistory.length !== 0
                ? getNewSendDate(item._source, sentMailHistory)?.send_date
                : null,
            status_when_mail_send:
              sentMailHistory.length !== 0
                ? getNewSendDate(item._source, sentMailHistory)?.status
                : null,
          }
        })
        .map(
          async (item) =>
            await getStatusSending(
              item.frequency_of_email,
              item.near_send_date,
              item.id,
              item.status_when_mail_send,
              item
            )
        )

      /**
       * Data dữ liệu khi Promise.allSettled
       */
      const data = await Promise.allSettled(dataCustomers).then((res) =>
        res.map((item) => camelcaseKeys(item.value))
      )

      const dataFilter = []
      if (statusSending) {
        //** Hàm xử lý khi gọi dữ liệu từ ElasticSearch */
        const datas = await elasticsearchClient.search({
          index: 'customers',
          body: {
            query:
              query.bool.must.length > 0 || query.bool.must_not.length > 0
                ? query
                : {
                    match_all: {},
                  },
            from: 0,
            size: dataCount?.count,
            sort: [{ created_at: { order: 'desc' } }],
          },
        })
        const dataCustomersStatus = datas.hits.hits
          ?.map((item) => ({
            ...item._source,
            user_name:
              personInCharge.length !== 0
                ? getpersonInCharge(item._source, personInCharge)?.name
                : null,
            customer_resource_name:
              customerResource.length !== 0
                ? getCustomerResource(item._source, customerResource)?.name
                : null,
            near_send_date:
              sentMailHistory.length !== 0
                ? getNewSendDate(item._source, sentMailHistory)?.send_date
                : null,
            status_when_mail_send:
              sentMailHistory.length !== 0
                ? getNewSendDate(item._source, sentMailHistory)?.status
                : null,
          }))
          .map(
            async (item) =>
              await getStatusSending(
                item.frequency_of_email,
                item.near_send_date,
                item.id,
                item.status_when_mail_send,
                item
              )
          )

        /**
         * Data dữ liệu khi Promise.allSettled
         */
        const dataStatus = await Promise.allSettled(dataCustomersStatus).then(
          (res) => res.map((item) => camelcaseKeys(item.value))
        )

        if (statusSending && statusSending === '1') {
          dataStatus
            .filter((item) => item.statusSending === 'Đã gửi')
            .forEach((item) => {
              dataFilter.push(item)
            })
        }

        if (statusSending && statusSending === '2') {
          dataStatus
            .filter((item) => item.statusSending === 'Chưa gửi')
            .forEach((item) => {
              dataFilter.push(item)
            })
        }

        if (statusSending && statusSending === '3') {
          dataStatus
            .filter((item) => item.statusSending === 'Gửi lỗi')
            .forEach((item) => {
              dataFilter.push(item)
            })
        }
      }

      return {
        customers: statusSending
          ? dataFilter.slice(offset, offset + perPage)
          : data,

        paginate: {
          totalRecord: statusSending ? dataFilter.length : datalength?.count,
          currentPage: +currentPage,
          perPage: +perPage,
        },
      }
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  //tìm kiếm sử dụng elasticsearch
  async searchByElacticsearch(params) {
    try {
      const { currentPage, perPage } = params.paginate

      const {
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
      } = params.filter

      const offset = (currentPage - 1) * perPage
      const dataFilter = []

      // Mảng chứa các giá trị tìm kiếm
      const query = {
        bool: {
          must: [],
          must_not: [],
        },
      }

      if (fieldName) {
        query.bool.must.push({
          match_phrase_prefix: { field_name: `*${fieldName}*` },
        })
      }

      if (size) {
        size === '3'
          ? query.bool.must_not.push({
              exists: {
                field: 'size',
              },
            })
          : query.bool.must.push({ match: { type } })
      }

      if (type) {
        type === '3'
          ? query.bool.must_not.push({
              exists: {
                field: 'type',
              },
            })
          : query.bool.must.push({ match: { type } })
      }

      if (revenue) {
        query.bool.must.push({ match: { revenue } })
      }

      if (investment) {
        query.bool.must.push({
          match_phrase_prefix: { investment: investment },
        })
      }

      if (name) {
        query.bool.must.push({
          match_phrase: { name: `*${name}*` },
        })
      }
      if (resourceId) {
        query.bool.must.push({ match: { customer_resource_id: resourceId } })
      }

      if (typeCustomer) {
        typeCustomer === '4'
          ? query.bool.must_not.push({
              exists: {
                field: 'type_of_customer',
              },
            })
          : query.bool.must.push({ match: { type_of_customer: typeCustomer } })
      }

      if (personInChargeId === '0' || personInChargeId) {
        personInChargeId === '0'
          ? query.bool.must_not.push({
              exists: {
                field: 'person_in_charge_id',
              },
            })
          : query.bool.must.push({
              match: {
                person_in_charge_id: personInChargeId,
              },
            })
      }

      if (reason) {
        query.bool.must.push({ match: { reason: `*${reason}*` } })
      }

      if (typeOfSend) {
        query.bool.must.push({ match: { type_of_send: typeOfSend } })
      }

      if (url) {
        query.bool.must.push({ match_phrase_prefix: { url: `*${url}*` } })
      }
      if (address) {
        query.bool.must.push({ match: { address: `*${address}*` } })
      }

      //** Hàm xử lý khi không truyền currentPage và Perpage */
      if (!currentPage && !perPage) {
        //** Hàm tính  tổng số lượng bản ghi*/
        const dataCount = await elasticsearchClient.count({
          index: 'customers',
          body: {
            query: {
              match_all: {},
            },
          },
        })

        const results = await elasticsearchClient.search({
          index: 'customers',
          body: {
            query: {
              match_all: {},
            },
            size: dataCount?.count,
            from: 0,
          },
        })
        const { hits } = results.hits

        return {
          customers:
            hits.length > 0
              ? hits.map((hit) => camelcaseKeys(hit._source))
              : [],
        }
      }

      //** Hàm tính  tổng số lượng bản ghi*/
      const dataCount = await elasticsearchClient.count({
        index: 'customers',
        body: {
          query: {
            match_all: {},
          },
        },
      })

      //** Hàm tính  tổng số lượng bản ghi*/
      const datalength = await elasticsearchClient.count({
        index: 'customers',
        body: {
          query:
            query.bool.must.length > 0 || query.bool.must_not.length > 0
              ? query
              : {
                  match_all: {},
                },
        },
      })

      //cài đặt số lượng kết quả trả về cho 1 truy vấn
      await elasticsearchClient.indices.putSettings({
        index: 'customers',
        body: {
          index: {
            max_result_window: +dataCount.count + 10000,
          },
        },
      })

      //** Hàm xử lý khi gọi dữ liệu từ ElasticSearch */
      const results = await elasticsearchClient.search({
        index: 'customers',
        body: {
          query:
            query.bool.must.length > 0 || query.bool.must_not.length > 0
              ? query
              : {
                  match_all: {},
                },
          from: statusSending ? 0 : offset,
          size: statusSending ? dataCount?.count : perPage,
          sort: [{ created_at: { order: 'desc' } }],
          profile: true,
        },
      })

      //** Hàm xử lý id từ bảng user có trong dữ liệu từ ElasticSearch (lưu ý : person_in_charge_id (id người phụ trách) )*/
      const personInCharge = await this.userModel.findAll({
        where: {
          id:
            results?.hits?.hits?.length !== 0
              ? results?.hits?.hits?.map(
                  (item) => item._source.person_in_charge_id
                )
              : [],
        },
      })

      const getPersonInCharge = (customers, personInCharge) => {
        const result = personInCharge?.find(
          (item) => item.id === customers.person_in_charge_id
        )
        return result?.name || ''
      }

      //** Hàm xử lý id từ bảng customerResource có trong dữ liệu từ ElasticSearch */
      const customerResource = await this.customerResourceModel.findAll({
        where: {
          id:
            results?.hits?.hits?.length !== 0
              ? results?.hits?.hits?.map(
                  (item) => item._source.customer_resource_id
                )
              : [],
        },
      })

      const getCustomerResource = (customers, customerResource) => {
        const result = customerResource.find(
          (item) => item.id === customers.customer_resource_id
        )
        return result?.name || ''
      }

      //** Hàm xử lý lấy ra tất cả lịch sử gửi theo id của customer sắp xếp giảm dần theo ngày gửi */

      const sentMailHistory = await this.sentMailHistory.findAll({
        where: {
          customer_id:
            results?.hits?.hits?.length !== 0
              ? results?.hits?.hits?.map((item) => item._source.id)
              : [],
          send_date: {
            [Op.not]: null,
          },
        },
        order: [['send_date', 'DESC']],
      })

      const getNewSendDate = (customers) => {
        const sentMail = sentMailHistory?.find((item) => {
          return item.customer_id === customers.id
        })
        return {
          send_date: sentMail?.send_date,
          status: sentMail?.status,
        }
      }

      /**
       * Mảng thu được sau khi lấy được dữ liêu sau khi kiểm tra các hàm trên
       */
      const dataCustomers = results?.hits?.hits
        ?.map((item) => {
          return {
            ...item._source,
            user_name: getPersonInCharge(item._source, personInCharge),
            customer_resource: getCustomerResource(
              item._source,
              customerResource
            ),
            send_date: getNewSendDate(item._source)?.send_date,
            status_when_mail_send: getNewSendDate(item._source)?.status,
          }
        })
        ?.map(
          async (item) =>
            await this.getStatusSending(
              item.frequency_of_email,
              item.send_date,
              item.id,
              item.status_when_mail_send,
              item
            )
        )

      const dataStatus = await Promise.allSettled(dataCustomers).then((res) =>
        res.map((item) => camelcaseKeys(item.value))
      )

      if (statusSending && statusSending === '0') {
        const newData = dataStatus.filter(
          (item) => item.statusSend === 'Đã gửi'
        )
        dataFilter.push(...newData)
      } else if (statusSending && statusSending === '1') {
        const newData = dataStatus.filter(
          (item) => item.statusSend === 'Chưa gửi'
        )
        dataFilter.push(...newData)
      } else if (statusSending && statusSending === '2') {
        const newData = dataStatus.filter(
          (item) => item.statusSend === 'Gửi lỗi'
        )
        dataFilter.push(...newData)
      } else dataFilter.push(...dataStatus)

      return {
        customers: statusSending
          ? dataFilter.slice(+offset, +offset + +perPage)
          : dataStatus,

        paginate: {
          totalRecord: statusSending ? dataFilter?.length : datalength?.count,
          currentPage: +currentPage,
          perPage: +perPage,
        },
      }
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }

  async getAllSql(req, res) {
    try {
      const limitInput = req.query.perPage
      const pageInput = req.query.currentPage
      const customerResourceId = req.query.resourceId
      const type = req.query.type === '2' ? '' : req.query.type
      const size = req.query.size === '4' ? '' : req.query.size
      const fieldName = req.query.fieldName
      const typeCustomer =
        req.query.typeCustomer === '0' ? '' : req.query.typeCustomer
      const personInChargeId = req.query.personInChargeId
      const reason = req.query.reason
      const typeOfSend =
        req.query.typeOfSend === '0' ? '' : req.query.typeOfSend
      const url = req.query.url
      const address = req.query.address
      const investment = req.query.investment
      const name = req.query.name

      const statusSending =
        req.query.statusSending === '0'
          ? 'Đã gửi'
          : req.query.statusSending === '1'
          ? 'Chưa gửi'
          : req.query.statusSending === '2'
          ? 'Gửi lỗi'
          : ''

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
        END as status_send `

      let fromSql = ` From ( select
        subquery.*,
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
            c.*,
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

      let groupby = ` GROUP BY c.id, c.name, c.romaji_name, c.url, c.email, c.address, c.frequency_of_email, c.customer_resource_id,
      c.start_date, c_r.id, c.created_at, c.person_in_charge_id, c.send_date, c.status, c.field_name, c.type,
      c.size, c.revenue, c.investment,
      c.note,
      c.type_of_customer,
      c.user_id,
      c.reason,
      c.near_send_date,
      c.type_of_send,
      c.created_by,
      c.updated_by,
      c.updated_at,
      c.deleted,
      c.rn,users.name
      ORDER BY c.created_at DESC ) as css `

      let whereSql = ` WHERE 1 = 1 `

      if (statusSending) {
        bindParam.push(statusSending)
        whereSql += ` AND css.status_send = $${bindParam.length} `
      }
      if (customerResourceId) {
        bindParam.push(customerResourceId)
        whereSql += ` AND css.customer_resource_id = $${bindParam.length} `
      }
      if (type) {
        const newType = req.query.type === '3' ? `is null` : req.query.type
        if (newType === `is null`) {
          whereSql += ` AND css.type is null `
        } else {
          bindParam.push(newType)
          whereSql += ` AND css.type = $${bindParam.length} `
        }
      }
      if (size) {
        const newSize = req.query.size === '3' ? `is null` : req.query.size
        if (newSize === `is null`) {
          whereSql += ` AND css.size is null `
        } else {
          bindParam.push(newSize)
          whereSql += ` AND css.size = $${bindParam.length} `
        }
      }
      if (typeCustomer) {
        const newTypeCustomer =
          req.query.typeCustomer === '4' ? `is null` : req.query.typeCustomer
        if (newTypeCustomer === `is null`) {
          whereSql += ` AND css.type_of_customer is null `
        } else {
          bindParam.push(newTypeCustomer)
          whereSql += ` AND css.type_of_customer = $${bindParam.length} `
        }
      }
      if (personInChargeId) {
        const newPersonInChargeId =
          req.query.personInChargeId === '0'
            ? `is null`
            : req.query.personInChargeId
        if (newPersonInChargeId === `is null`) {
          whereSql += ` AND css.person_in_charge_id is null `
        } else {
          bindParam.push(newPersonInChargeId)
          whereSql += ` AND css.person_in_charge_id = $${bindParam.length} `
        }
      }
      if (name) {
        bindParam.push('%' + name + '%')
        whereSql += ` AND css.name ilike $${bindParam.length} `
      }
      if (fieldName) {
        bindParam.push('%' + fieldName + '%')
        whereSql += ` AND css.field_name ilike $${bindParam.length} `
      }
      if (address) {
        bindParam.push('%' + address + '%')
        whereSql += ` AND css.address ilike $${bindParam.length} `
      }
      if (url) {
        bindParam.push('%' + url + '%')
        whereSql += ` AND css.url ilike $${bindParam.length} `
      }
      if (investment) {
        bindParam.push(investment)
        whereSql += ` AND css.investment = $${bindParam.length} `
      }
      if (typeOfSend) {
        bindParam.push(typeOfSend)
        whereSql += ` AND css.type_of_send = $${bindParam.length} `
      }
      if (reason) {
        bindParam.push('%' + reason + '%')
        whereSql += ` AND css.reason ilike $${bindParam.length} `
      }

      let rawSql = selectSql + fromSql + leftJoin + groupby + whereSql

      if (!limitInput || !pageInput) {
        const elements = await sequelize.query(rawSql, {
          bind: bindParam,
          type: QueryTypes.SELECT,
        })

        const customerResourceData = {
          customers: elements,
        }
        return this.result(200, true, Message.SUCCESS, customerResourceData)
      }

      const result = await sequelize.query(rawSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

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
        customers: elements,

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

  /**
   *
   * @param {*} date : Dựa theo tần suất gửi mail ( 1 tuần = 7 ngày ,....)
   * @param {*} customer_id : id của từng khách hàng
   * @returns : Trả về một mảng các giá trị
   */
  async checkSendDateDuringFrequencyOfEmail(date, customer_id) {
    return await this.sentMailHistoryModel.findAll({
      where: {
        send_date: {
          [Op.between]: [
            new moment(Date.now()).add(-1 * date, 'd'),
            new moment(Date.now()),
          ], // Lọc các email trong khoảng thời gian này
        },
        customer_id: customer_id,
      },
    })
  }

  /**   
  tính trạng thái gửi 
        frequency_of_email : Tần suất gửi mail
        near_send_date  : Ngày gửi gần nhất
        customer_id : id của khách hàng
        item : object từ bảng customer => Trạng thái gửi(status_sending) : Đã gửi và Chưa gửi
  * */
  async getStatusSending(
    frequency_of_email,
    near_send_date,
    customer_id,
    status_when_mail_send,
    item
  ) {
    if (!near_send_date || frequency_of_email === null) {
      return {
        ...item,
        status_send: 'Chưa gửi',
      }
    }

    const sendDateCheck = async (days) =>
      (await this.checkSendDateDuringFrequencyOfEmail(days, customer_id))
        .length > 0

    switch (frequency_of_email) {
      case '1':
        if (await sendDateCheck(7)) {
          return {
            ...item,
            status_send: status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
          }
        }
        break
      case '2':
        if (await sendDateCheck(30)) {
          return {
            ...item,
            status_send: status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
          }
        }
        break
      case '3':
        if (await sendDateCheck(60)) {
          return {
            ...item,
            status_send: status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
          }
        }
        break
      case '4':
        if (await sendDateCheck(90)) {
          return {
            ...item,
            status_send: status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
          }
        }
        break
      case '5':
        if (await sendDateCheck(180)) {
          return {
            ...item,
            status_send: status_when_mail_send === 2 ? 'Gửi lỗi' : 'Đã gửi',
          }
        }
        break
      default:
        break
    }

    return {
      ...item,
      status_send: 'Chưa gửi',
    }
  }
}

export default new CustomerService()
