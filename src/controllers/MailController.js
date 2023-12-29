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
  }
  async sendMailToNewUser(req, res) {
    const { email, password } = req.body
    try {
      const result = await SendMailService.sendUser({ email, password })

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
}
