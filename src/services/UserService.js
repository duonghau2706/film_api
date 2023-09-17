import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import { Message } from '@/utils/Message'

import * as dotenv from 'dotenv'
import { UserModel, EffortMemberModel, CustomerModel } from '@/models'
import { Op } from 'sequelize'
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
  async get(params) {
    const { currentPage, perPage } = params
    try {
      const getAllPersonInCharge = await this.customerModel
        .findAll({
          where: {
            person_in_charge_id: {
              [Op.not]: null,
            },
          },
        })
        .then((res) => res.map((item) => item.person_in_charge_id))

      if (!currentPage) {
        const users = await this.userModel.findAll({
          where: {
            deleted: false,
          },
        })
        return {
          element: users.map((item) => camelcaseKeys(item.dataValues)),
          personInCharge:
            getAllPersonInCharge.length > 0
              ? getAllPersonInCharge
                  .filter(
                    (item, index) =>
                      getAllPersonInCharge.indexOf(item) === index
                  )
                  .map((item) => {
                    return {
                      label: users
                        .map((item) => camelcaseKeys(item.dataValues))
                        .find((e) => e.id === item)?.name,
                      value: item,
                    }
                  })
              : [],
        }
      }

      const filterValue = {
        ...(params.name
          ? {
              name: {
                [Op.iLike]: `%${params.name}%`,
              },
            }
          : {}),
        ...(params.email
          ? {
              email: {
                [Op.iLike]: `%${params.email}%`,
              },
            }
          : {}),
        ...(params.role
          ? {
              role: params.role,
            }
          : {}),
        deleted: false,
      }

      const count = await this.userModel.count({
        where: {
          [Op.and]: filterValue,
          deleted: false,
        },
      })
      const skip = (+currentPage - 1) * +perPage

      const users = await this.userModel.findAll({
        where: {
          [Op.and]: filterValue,
          deleted: false,
        },
        order: [['created_at', 'DESC']],
        limit: perPage || 10,
        offset: skip,
      })
      return {
        element: users.map((item) => camelcaseKeys(item.dataValues)),
        personInCharge:
          getAllPersonInCharge.length > 0
            ? getAllPersonInCharge
                .filter(
                  (item, index) => getAllPersonInCharge.indexOf(item) === index
                )
                .map((item) => {
                  return {
                    label: users
                      .map((item) => camelcaseKeys(item.dataValues))
                      .find((e) => e.id === item)?.name,
                    value: item,
                  }
                })
            : [],
        totalRecord: count,
        perPage: +perPage,
        currentPage: +currentPage,
      }
    } catch (error) {
      throw error
    }
  }
  async update({ role, id }) {
    try {
      const user = await this.userModel.update(
        {
          role,
        },
        {
          where: {
            id,
          },
          returning: true,
        }
      )
      return user[1][0]
    } catch (error) {
      throw error
    }
  }

  async recordWorkingTime(params, decode) {
    try {
      const data = cleanObj(params)
      const dateString = params?.work_date
      const [day, month, year] = dateString.split('/')
      const date = new Date(year, month - 1, day)

      const getAllUser = await this.userModel
        .findAll({})
        .then((res) => res.map((item) => item.dataValues))
      // .then((res) => res?.dataValues)

      const checkExistRecird = await this.effortMemberModel.findOne({
        where: {
          user_id: params.user_id,
          work_date: date,
        },
      })
      if (!checkExistRecird) {
        const effortMembersCreate = await EffortMemberRepository.create({
          ...data,
          created_by: decode.username,
          name_user: data.name_user
            ? data.name_user
            : getAllUser.find((e) => e.id === data.user_id)?.name,
          work_date: date,
        })
        return effortMembersCreate
      }

      delete data.work_date

      const effortMembersCreate = await EffortMemberRepository.update({
        option: { id: checkExistRecird.id },
        data: { ...data, updated_by: decode.username },
      })
      return effortMembersCreate
    } catch (error) {
      throw error
    }
  }

  async viewAllEffortOfMember(params) {
    try {
      const filterValue = {
        ...(params.dateFilter
          ? {
              work_date: {
                [Op.between]: [params.dateFilter[0], params.dateFilter[1]],
              },
            }
          : {}),

        ...(params.userId
          ? {
              user_id: params.userId,
            }
          : {}),
      }

      const users = await this.effortMemberModel.findAll({
        where: {
          [Op.and]: filterValue,
        },
      })
      return {
        element: users.map((item) => camelcaseKeys(item.dataValues)),
      }
    } catch (error) {
      throw error
    }
  }

  async deleteById(id) {
    try {
      const findData = await this.userModel.findOne({
        where: {
          id,
        },
      })
      if (!findData) {
        return this.result(false, 400, Message.USER_NOT_FIND, null)
      }

      const payload = {
        data: { deleted: true },
        option: { id },
      }

      const updateUser = await UserRepository.update(payload)

      const paramToken = {
        data: { token: '' },
        option: { user_id: updateUser?.[0]?.id },
      }

      if (updateUser?.length > 0) {
        await TokenRepository.update(paramToken)

        return this.result(false, 400, Message.DELETE_USER_SUCCESS, null)
      }

      return this.result(false, 400, Message.USER_NOT_DELETE, null)
    } catch (error) {
      throw {
        statusCode: 400,
        message: Message.USER_NOT_FIND,
      }
    }
  }
}

export default new UserService()
