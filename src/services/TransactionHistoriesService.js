import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import { Message } from '@/utils/Message'

import * as dotenv from 'dotenv'
import { UserModel, EffortMemberModel, CustomerModel } from '@/models'
import { Op, QueryTypes } from 'sequelize'
import camelcaseKeys from 'camelcase-keys'
import {
  TokenRepository,
  UserRepository,
  EffortMemberRepository,
} from '@/repositories'
import { cleanObj } from '@/helpers/obj'
import moment from 'moment'
import { sequelize } from '@/helpers/connection'

dotenv.config()

const logger = log4js.getLogger()
class UserService {
  constructor() {
    this.userModel = UserModel
    this.customerModel = CustomerModel
    this.result = ResponseUtils
    this.effortMemberModel = EffortMemberModel
    this.customerModel = CustomerModel
  }
  async create(req) {
    const id = req?.body?.id
    const userId = req?.body?.userId
    const bankName = req?.body?.bankName
    const bankAccount = req?.body?.bankAccount
    const money = req?.body?.money ?? null
    const accountBalance = req?.body?.accountBalance
    const service = req?.body?.service ?? null
    const createdAt = req?.body?.createdAt
    const updatedAt = req?.body?.updatedAt

    try {
      const THsql = `insert into transaction_histories (id, user_id, money, account_balance, service, bank_name, bank_account, created_at, updated_at) values ('${id}', '${userId}', ${money}, ${accountBalance}, ${service}, '${bankName}', '${bankAccount}', '${createdAt}', '${updatedAt}')`
      const createTH = await sequelize.query(THsql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, createTH)
    } catch (error) {
      throw error
    }
  }
}

export default new UserService()
