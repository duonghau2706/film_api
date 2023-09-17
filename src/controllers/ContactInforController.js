import { sequelize } from '@/helpers/connection'
import { ContactInforModel } from '@/models'
import { ContactInforService } from '@/services'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import camelcaseKeys from 'camelcase-keys'
import { QueryTypes } from 'sequelize'

export default class ContactInforController {
  constructor() {
    this.response = ResponseUtils
    this.contactInforModel = ContactInforModel
  }

  async get(req, res) {
    try {
      const result = await ContactInforService.get()

      const data = {
        ...result.data,
        contactInfor: camelcaseKeys(result.data.contactInfor),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  async update(req, res) {
    const {
      id,
      nameKanji,
      nameHira,
      nameKata,
      nameCompanyKanji,
      nameCompanyHira,
      nameCompanyKata,
      addressKanji,
      addressHira,
      addressKata,
      positionKanji,
      positionHira,
      positionKata,
      mail,
      url,
      positionName,
      postOfficeCode,
      phoneNumber,
      field,
      title,
      createdBy,
      updatedBy,
    } = req.body

    try {
      let result
      let bindParam = []

      let selectSql = ` SELECT * FROM public.contact_infors where id = '${id}' `

      const resultFind = await sequelize.query(selectSql, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      const payload = {
        contactInfor: {
          name_kanji: nameKanji ? nameKanji : '',
          name_hira: nameHira ? nameHira : '',
          name_kata: nameKata ? nameKata : '',
          name_company_kanji: nameCompanyKanji ? nameCompanyKanji : '',
          name_company_hira: nameCompanyHira ? nameCompanyHira : '',
          name_company_kata: nameCompanyKata ? nameCompanyKata : '',
          address_kanji: addressKanji ? addressKanji : '',
          address_hira: addressHira ? addressHira : '',
          address_kata: addressKata ? addressKata : '',
          position_kanji: positionKanji ? positionKanji : '',
          position_hira: positionHira ? positionHira : '',
          position_kata: positionKata ? positionKata : '',
          mail: mail ? mail : '',
          url: url ? url : '',
          position_name: positionName ? positionName : '',
          post_office_code: postOfficeCode ? postOfficeCode : '',
          phone_number: phoneNumber ? phoneNumber : '',
          field: field ? field : '',
          title: title ? title : '',
          created_by: createdBy ? createdBy : resultFind?.[0]?.created_by,
          updated_by: updatedBy ? updatedBy : '',
        },
        id,
      }

      if (resultFind?.length > 0) {
        result = await ContactInforService.update(payload).then((res) => res[0])
      } else
        result = await ContactInforService.create(payload).then((res) => res)

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

    try {
      const result = await ContactInforService.findById(id)

      const contactInfor = camelcaseKeys(result)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, contactInfor))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }
}
