import { sequelize } from '@/helpers/connection'
import { verifyToken } from '@/helpers/token'
import { PdfService, UserService } from '@/services'
import TransactionHistoriesService from '@/services/TransactionHistoriesService'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import { findByIdUserValidate, updateUserValidate } from '@/validations'
import camelcaseKeys from 'camelcase-keys'
import * as dotenv from 'dotenv'
import log4js from 'log4js'
import { QueryTypes } from 'sequelize'
import ejs from 'ejs'

dotenv.config()
const logger = log4js.getLogger()

export default class UserController {
  constructor() {
    this.response = ResponseUtils
  }

  async getReport(req, res, next) {
    try {
      const reportPdf = await PdfService.getPdf(req, res)
      // console.log('reportPdf', reportPdf)
      res.set('Content-Type', 'application/pdf')
      res.status(200).send(reportPdf)

      // res.status(200).json(reportPdf)
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }
}
