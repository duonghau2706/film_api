import { sequelize } from '@/helpers/connection'
import { ContactInforModel } from '@/models'
import { ContactInforRepositiory } from '@/repositories'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import * as dotenv from 'dotenv'

const { QueryTypes } = require('sequelize')
dotenv.config()

class ContactInforService {
  constructor() {
    this.result = ResponseUtils
    this.contactInforModel = ContactInforModel
  }

  async create(payload) {
    try {
      const contactInfor = await ContactInforRepositiory.create(
        payload?.contactInfor
      )
      return contactInfor
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
        data: params.contactInfor,
        option: { id: params.id },
      }
      const contactInfor = await ContactInforRepositiory.update(payload)
      return contactInfor
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.DO_NOT_UPDATE,
      }
    }
  }

  async findById(id) {
    try {
      return await this.contactInforModel
        .findOne({
          where: {
            id: id,
          },
        })
        .then((res) => res.dataValues)
    } catch (error) {
      console.error(error)
      throw {
        statusCode: 400,
        message: Message.CONTACT_INFOR_NOT_FIND,
      }
    }
  }

  async get() {
    try {
      let selectSql = 'SELECT * FROM public.contact_infors '

      let bindParam = []

      const result = await sequelize.query(selectSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      const contactInforData = {
        contactInfor: result,
      }
      return this.result(200, true, Message.SUCCESS, contactInforData)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error?.message,
      }
    }
  }
}

export default new ContactInforService()
