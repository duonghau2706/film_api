import { sequelize } from '@/helpers/connection'
import { verifyToken } from '@/helpers/token'
import { UserService } from '@/services'
import TransactionHistoriesService from '@/services/TransactionHistoriesService'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import { findByIdUserValidate, updateUserValidate } from '@/validations'
import camelcaseKeys from 'camelcase-keys'
import * as dotenv from 'dotenv'
import log4js from 'log4js'
import { QueryTypes } from 'sequelize'

dotenv.config()
const logger = log4js.getLogger()

export default class UserController {
  constructor() {
    this.response = ResponseUtils
  }

  async create(req, res, next) {
    try {
      const transactionHistories = await TransactionHistoriesService.create(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, transactionHistories))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }
}
