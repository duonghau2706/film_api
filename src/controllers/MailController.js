import { verifyToken } from '@/helpers/token'
import { SendMailService } from '@/services'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import * as dotenv from 'dotenv'

import { SentMailHistoryModel } from '@/models'
import { findByIdValidateEmail } from '@/validations'
import camelcaseKeys from 'camelcase-keys'
import { create_UUID } from '@/helpers/common'

dotenv.config()
export default class MailController {
  constructor() {
    this.response = ResponseUtils
    this.sentMailHistoryModel = SentMailHistoryModel
  }
  async sendMailToCustomers(req, res) {
    const { data } = req.body
    try {
      const decode = verifyToken(req)

      const result = await SendMailService.sendMulti(data, decode)

      res
        .status(200)
        .send(
          this.response(
            200,
            'Email đã được thêm vào hàng đợi',
            null,
            result,
            null
          )
        )
    } catch (error) {
      console.log(error)
      res.status(400).send(this.response(400, error.message, null))
    }
  }

  //xem chi tiết của 1 lần gửi mail
  async findById(req, res) {
    try {
      const result = await SendMailService.findById(req)

      const emailHistory = camelcaseKeys(result?.data?.emailHistory)

      const newData = { ...result?.data, emailHistory }

      res.status(200).json(this.response(200, Message.SUCCESS, null, newData))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  //lấy lịch sử gửi mail
  async get(req, res) {
    try {
      const result = await SendMailService.get(req)

      const data = {
        ...result.data,
        emailHistory: camelcaseKeys(
          result?.data?.emailHistory?.map((item) => {
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

  async update(req, res, next) {
    const { id, statusFeedback, feedbackDate } = req.body

    try {
      const decode = verifyToken(req)
      const payload = {
        id,
        data: {
          feedback_date: feedbackDate,
          status_feedback: statusFeedback,
          updated_by: decode.username,
        },
      }

      const result = await SendMailService.update(payload).then((res) => res[0])
      const data = camelcaseKeys(result.dataValues)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }
}
