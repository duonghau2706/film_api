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

  async getUserByEmail(req, res, next) {
    try {
      const users = await UserService.getUserByEmail(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, users))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async get(req, res, next) {
    try {
      const users = await UserService.getUser(req?.query)
      res.status(200).json(this.response(200, Message.SUCCESS, null, users))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async createUser(req, res, next) {
    try {
      const users = await UserService.createUser(req?.body)
      res.status(200).json(this.response(200, Message.SUCCESS, null, users))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async updateUser(req, res, next) {
    try {
      const users = await UserService.updateUser(req?.body)
      res.status(200).json(this.response(200, Message.SUCCESS, null, users))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async deleteUser(req, res, next) {
    try {
      const users = await UserService.deleteUser(req?.body)
      res.status(200).json(this.response(200, Message.SUCCESS, null, users))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getProfile(req, res, next) {
    try {
      const users = await UserService.getProfile(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, users))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getTransactionHistories(req, res, next) {
    try {
      const transactionHistories = await UserService.getTransactionHistories(
        req
      )
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, transactionHistories))
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

  async updateListMovie(req, res, next) {
    try {
      const userListMovie = await UserService.updateListMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, userListMovie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userProfile = await UserService.updateProfile(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, userProfile))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async updateAccount(req, res, next) {
    try {
      const userAccount = await UserService.updateAccount(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, userAccount))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async updateStatusMember(req, res, next) {
    try {
      const userAccount = await UserService.updateStatusMember(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, userAccount))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getUserDb(req, res, next) {
    try {
      const userDb = await UserService.getUserDb(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, userDb))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async createNewAccount(req, res, next) {
    try {
      const account = await UserService.createNewAccount(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, account))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }
}
