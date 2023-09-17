import { create_UUID } from '@/helpers/common'
import { SentMailHistoryModel } from '@/models'
import { InquiryService } from '@/services'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import { findByIdValidateEmail } from '@/validations/emailHistory'
import camelcaseKeys from 'camelcase-keys'

export default class InquiryController {
  constructor() {
    this.response = ResponseUtils
    this.sentMailHistoryModel = SentMailHistoryModel
  }

  async findById(req, res) {
    try {
      const result = await InquiryService.findById(req)

      const inquiryHistory = camelcaseKeys(result?.data?.inquiryHistory)

      const newData = { ...result?.data, inquiryHistory }

      res.status(200).json(this.response(200, Message.SUCCESS, null, newData))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async get(req, res) {
    try {
      const result = await InquiryService.get(req)

      const data = {
        ...result.data,
        inquiryHistory: camelcaseKeys(
          result.data.inquiryHistory?.map((item) => {
            return { ...item, id: create_UUID() }
          })
        ),
      }

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }
}
