import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import { Message } from '@/utils/Message'

import * as dotenv from 'dotenv'
import { element as elementPaginate } from '@/helpers/paginate'

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
import { boolean } from 'joi'

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

  async getUser(query) {
    const limitInput = query?.perPage
    const pageInput = query?.currentPage
    const bank_name = query?.bank_name
    const email = query?.email
    const is_member = query?.is_member
    const name = query?.name
    const phone = query?.phone
    const service = query?.service
    const gender = query?.gender

    try {
      let userSql = 'select * from users where 1=1'

      if (bank_name?.trim()?.length > 0) {
        userSql += ` and bank_name='${bank_name}'`
      }

      if (email?.trim()?.length > 0) {
        userSql += ` and email='${email}'`
      }

      if (is_member === 'true' || is_member === 'false') {
        userSql += ` and is_member=${is_member}`
      }

      if (name?.trim()?.length > 0) {
        userSql += ` and name='${name}'`
      }

      if (phone?.trim()?.length > 0) {
        userSql += ` and phone='${phone}'`
      }

      if (service?.trim()?.length > 0) {
        userSql += ` and service=${service}`
      }

      if (gender?.trim()?.length > 0) {
        userSql += ` and gender=${gender}`
      }

      let getUser = await sequelize.query(userSql, {
        type: QueryTypes.SELECT,
      })

      let totalPageRes = 1
      let pageRes = pageInput
      let total = getUser?.length

      if (limitInput || pageInput) {
        const { totalPage, page, offset } = elementPaginate({
          totalRecord: getUser?.length,
          page: pageInput,
          limit: limitInput,
        })

        totalPageRes = totalPage
        pageRes = page
        getUser = await sequelize.query(
          userSql + ` LIMIT ${limitInput} OFFSET ${offset}`,
          { type: QueryTypes.SELECT }
        )
      }

      const dataRes = {
        listUser: getUser,
        pagination: {
          totalPageRes: +totalPageRes,
          pageRes: +pageRes,
          total: +total,
        },
      }

      return this.result(200, true, Message.SUCCESS, dataRes)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async createUser(body) {
    const name = body?.name
    const born = body?.born
    const email = body?.email
    const service = body?.service ?? 4
    const password = body?.password
    const money = body?.money ?? 0
    const phone = body?.phone
    const bank_name = body?.bank_name
    const address = body?.address
    const bank_account = body?.bank_account
    const is_member = body?.is_member ?? false
    const id = body?.id
    const renewal_date = body?.renewal_date
    const gender = body?.gender ?? 1
    const created_by = body?.created_by
    const created_at = body?.created_at
    const updated_at = body?.updated_at

    try {
      const userSql = `insert into
    users(
        name,
        born,
        email,
        service,
        password,
        money,
        phone,
        bank_name,
        address,
        bank_account,
        is_member,
        id,
        renewal_date,
        gender,
        created_by,
        created_at,
        updated_at
    )
    values ('${name}',
        '${born}',
        '${email}',
        ${service},
        '${password}',
        ${money},
        '${phone}',
        '${bank_name}',
        '${address}',
        '${bank_account}',
        ${is_member},
        '${id}',
        '${renewal_date}',
        ${gender},
        '${created_by}',
        '${created_at}',
        '${updated_at}')`
      const user = await sequelize.query(userSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, user)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateUser(body) {
    const {
      name,
      born,
      email,
      service,
      password,
      money,
      phone,
      bank_name,
      address,
      bank_account,
      is_member,
      id,
      renewal_date,
      gender,
      updated_by,
      updated_at,
    } = body
    try {
      const userSql = `update users set name='${name}', born='${born}', email='${email}', service=${service}, password='${password}', money=${money}, phone='${phone}', bank_name='${bank_name}', address='${address}', bank_account='${bank_account}', is_member=${is_member}, renewal_date='${renewal_date}', gender=${gender}, updated_by='${updated_by}', updated_at='${updated_at}' where id='${id}'`
      const user = await sequelize.query(userSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, user)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async deleteUser(query) {
    const listId = query?.listId

    try {
      const deleteUserSql = `delete from users where id in (${listId})`
      const deleteUser = await sequelize.query(deleteUserSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, deleteUser)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getProfile(req) {
    const { userId } = req?.query
    try {
      const profileSql = `select * from users where id = '${userId}'`
      const getProfile = await sequelize.query(profileSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, getProfile)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getTransactionHistories(req) {
    const { userId } = req.query
    try {
      const historiesSql = `select
          *
      from
          transaction_histories 
      where
          user_id = '${userId}'
      order by
          created_at desc`
      const getHistories = await sequelize.query(historiesSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, getHistories)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateProfile(req) {
    const { userId, name, email, born, address, phone } = req.body

    try {
      const profileSql = `update users set name = '${name}', email = '${email}', born = '${born}', address = '${address}', phone = '${phone}' where id = '${userId}'`
      const updateProfile = await sequelize.query(profileSql, {
        type: QueryTypes.SELECT,
      })

      const getProfileSql = `select * from users where id = '${userId}'`
      const getProfile = await sequelize.query(getProfileSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, getProfile)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateAccount(req) {
    const userId = req?.body?.userId
    const bankName = req?.body?.bankName
    const bankAccount = req?.body?.bankAccount
    const money = req?.body?.money
    const service = req?.body?.service
    const updatedAt = req?.body?.updatedAt
    const renewalDate = req?.body?.renewalDate
    const isMember = req?.body?.isMember

    try {
      let accountSql = `update users set bank_name = '${bankName}', bank_account = '${bankAccount}', money = ${money}, updated_at = '${updatedAt}'`
      if (service !== null && service !== undefined) {
        accountSql += `, service = ${service}`
      }

      if (renewalDate) {
        accountSql += `, renewal_date = '${renewalDate}'`
      }

      if (isMember !== null && isMember !== undefined) {
        accountSql += `, is_member = ${isMember}`
      }

      const whereSql = ` where id = '${userId}'`
      console.log('sql nnenenne', accountSql)
      const updateAccount = await sequelize.query(accountSql + whereSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, updateAccount)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateListMovie(req) {
    const { userId, listMovieId } = req.body

    try {
      const profileSql = `update users set list_movie_id = '${listMovieId}' where id = '${userId}'`
      const updateListMovie = await sequelize.query(profileSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, updateListMovie)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateStatusMember(req) {
    const { email } = req?.body

    try {
      const sql = `update users set is_member = true where TO_TIMESTAMP(renewal_date, 'YYYY-MM-DD HH24:MI:SS.MS') > CURRENT_TIMESTAMP and email = '${email}'`
      const sql2 = `update users set is_member = false where TO_TIMESTAMP(renewal_date, 'YYYY-MM-DD HH24:MI:SS.MS') <= CURRENT_TIMESTAMP and email = '${email}'`

      const updateStatusMember = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      })

      const updateStatusMember2 = await sequelize.query(sql2, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, 'Update succesful!')
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getUserDb(req) {
    const enteredStartDatetUser = req?.body?.enteredStartDatetUser
    const enteredEndDateUser = req?.body?.enteredEndDateUser

    try {
      let sql =
        enteredStartDatetUser && enteredEndDateUser
          ? `select
            th.user_id,
            users.name,
            count(th.*) as number_of_trans,
            sum(th.money) as revenue
        from
            transaction_histories as th
            left join users on th.user_id = users.id
        where
            users.gender = 1 and th.created_at between'${enteredStartDatetUser}' and '${enteredEndDateUser}'
        group by
            th.user_id,
            users.name`
          : `select
            th.user_id,
            users.name,
            count(th.*) as number_of_trans,
            sum(th.money) as revenue
        from
            transaction_histories as th
            left join users on th.user_id = users.id
        where
            users.gender = 1
        group by
            th.user_id,
            users.name`

      const getAllUserDb = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, getAllUserDb)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getUserByEmail(req) {
    const email = req?.body?.email

    try {
      const sql = `select * from users where email='${email}'`
      const data = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, data)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async createNewAccount(req) {
    const {
      id,
      email,
      password,
      gender,
      role,
      is_member,
      deleted,
      renewal_date,
      created_at,
      updated_at,
    } = req?.body

    try {
      const sql = `insert into
    users (
        id,
        email,
        password,
        gender,
        role,
        is_member,
        deleted,
        renewal_date,
        created_at,
        updated_at
    )
values
    ('${id}',
      '${email}',
      '${password}',
      '${gender}',
      '${role}',
      '${is_member}',
      '${deleted}',
      '${renewal_date}',
      '${created_at}',
      '${updated_at}')`

      console.log('sql', sql)
      const data = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, data)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }
}

export default new UserService()
