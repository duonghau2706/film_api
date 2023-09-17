import { sequelize } from '@/helpers/connection'
import { verifyToken } from '@/helpers/token'
import { UserService } from '@/services'
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
  async get(req, res, next) {
    try {
      const { name, email, role, currentPage, perPage } = req.query
      const users = await UserService.get({
        name,
        email,
        role,
        currentPage,
        perPage,
      })
      res.status(200).json(this.response(200, Message.SUCCESS, null, users))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async update(req, res, next) {
    const { id, role } = req.body
    try {
      const { error } = updateUserValidate({ role })
      if (error) {
        throw error
      }
      const user = await UserService.update({ id, role })
      res
        .status(200)
        .json(
          this.response(
            200,
            Message.SUCCESS,
            null,
            camelcaseKeys(user.dataValues)
          )
        )
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async deleteById(req, res) {
    const { id } = req.body
    const decode = verifyToken(req)

    const { error } = findByIdUserValidate({
      id,
    })

    let bindParam = []

    if (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }

    if (decode?.id === id) {
      return res
        .status(400)
        .json(this.response(400, Message.MYSELF_NOT_DELETE, null))
    }

    const select = `Select * from customers where customers.person_in_charge_id = '${id}'`

    const result = await sequelize.query(select, {
      bind: bindParam,
      type: QueryTypes.SELECT,
    })

    if (result?.length > 0) {
      return res
        .status(400)
        .json(this.response(400, Message.DELETE_USER_PERSON_IN_CHARGE, null))
    }

    try {
      await UserService.deleteById(id)

      res.status(200).json(this.response(200, Message.SUCCESS, null, null))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async recordWorkingTime(req, res, next) {
    const { userId, name, numberWorkHours, note, workDate } = req.body

    try {
      const decode = verifyToken(req)
      const payload = {
        user_id: userId,
        name_user: name,
        number_work_hours: numberWorkHours,
        note,
        work_date: workDate,
      }
      const user = await UserService.recordWorkingTime(payload, decode)
      res
        .status(200)
        .json(
          this.response(
            200,
            Message.SUCCESS,
            null,
            camelcaseKeys(user.dataValues)
          )
        )
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }
  async viewAllEffortOfMember(req, res, next) {
    const { userId, dateFilter } = req.query

    try {
      const members = await UserService.viewAllEffortOfMember({
        userId,
        dateFilter,
      })
      res.status(200).json(this.response(200, Message.SUCCESS, null, members))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }
}
