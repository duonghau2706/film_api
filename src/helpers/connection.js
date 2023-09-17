import { Sequelize } from 'sequelize'
import {
  TokenModel,
  UserModel,
  CustomerModel,
  GroupTemplateModel,
  TemplateModel,
  MailHistoryModel,
  SentMailHistoryModel,
  CustomerResourceModel,
  ContactInforModel,
  EffortMemberModel,
  DetailImportCustomerHistoriesModel,
  ImportCustomerHistoriesModel,
  SalekitCategoriesModel,
  SalekitDocumenHistoriesModel,
  SalekitDocumentModel,
} from '../models'
import log4js from './logger'
import * as dotenv from 'dotenv'
import { elasticsearchClient } from '@/server'
dotenv.config()
const logger = log4js.system
export const sequelize = new Sequelize(process.env.DATABASE_CONNECTION, {
  // disable logging; default: console.log
  logging: false,
  dialectOptions: {
    useUTC: true,
  },
})

export const connectionDB = async () => {
  try {
    await sequelize.authenticate()

    // await UserModel.sync({ alter: true })
    // await TokenModel.sync({ alter: true })
    // await CustomerModel.sync({ alter: true })
    // await TemplateModel.sync({ alter: true })
    // await SentMailHistoryModel.sync({ alter: true })
    // await CustomerResourceModel.sync({ alter: true })
    // await ContactInforModel.sync({ alter: true })
    // await EffortMemberModel.sync({ alter: true })
    // await ImportCustomerHistoriesModel.sync({ alter: true })
    // await DetailImportCustomerHistoriesModel.sync({ alter: true })
    // await SalekitDocumentModel.sync({ alter: true })
    // await SalekitCategoriesModel.sync({ alter: true })
    // await SalekitDocumenHistoriesModel.sync({ alter: true })

    logger.info('Database connection successful')
  } catch (error) {
    logger.error('Cannot connect database: ', error)
  }
}

export const importData = async () => {
  try {
    const checkIndexExist = await elasticsearchClient.indices.exists({
      index: 'customers_index',
    })
    if (checkIndexExist) {
      await elasticsearchClient.indices.delete({ index: 'customers_index' })
    }
    // Lấy tất cả bản ghi từ bảng
    const customers = await CustomerModel.findAll()

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
  } catch (error) {
    console.log(error)
    console.error('Lỗi khi ánh xạ dữ liệu:', error)
  }
}
