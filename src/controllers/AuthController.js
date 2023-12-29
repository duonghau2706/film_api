import AuthService from '@/services/AuthService'
import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import { Message } from '@/utils/Message'
import {
  changePasswordValidate,
  forgetPasswordValidate,
  loginValidate,
} from '@/validations'

import jwt from 'jsonwebtoken'
import { castArray } from 'lodash'
import { verifyToken } from '@/helpers/token'
const logger = log4js.getLogger()
export default class AuthController {
  constructor() {
    this.response = ResponseUtils
  }
  //

  async systemLogin(req, res, next) {
    const LOG_TITLE = `[Login]`
    logger.debug(LOG_TITLE, 'Start')

    try {
      const { email, password } = req.body
      const result = await AuthService.systemLogin(email, password)
      res.status(200).json(
        this.response(200, Message.SUCCESS, null, {
          token: result,
        })
      )
    } catch (error) {
      logger.error(LOG_TITLE, error)

      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    } finally {
    }
  }

  // async changePassword(req, res, next) {
  //   const { password, newPassword, confirmNewPassword } = req.body
  //   const token = req.headers.authorization?.split(' ')?.[1]
  //   try {
  //     const { error } = changePasswordValidate({
  //       password,
  //       newPassword,
  //       confirmNewPassword,
  //     })
  //     if (error) {
  //       return res.status(400).json(this.response(400, error.message, null))
  //     }

  //     const decode = verifyToken(token)

  //     const newToken = await AuthService.changePassword(
  //       decode.email,
  //       password,
  //       newPassword
  //     )

  //     res.status(200).json(
  //       this.response(200, Message.SUCCESS, null, {
  //         token: newToken,
  //       })
  //     )
  //   } catch (error) {
  //     res
  //       .status(error?.statusCode || 400)
  //       .json(this.response(error.statusCode, error.message, null))
  //   } finally {
  //   }
  // }

  async verifyToken(req, res) {
    try {
      const user = await AuthService.verifyToken(req)

      res.status(200).json(this.response(200, Message.SUCCESS, null, user))
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode, error.message, null))
    }
  }

  // async forgetPassword(req, res, next) {
  //   const { email } = req.body

  //   const { error } = forgetPasswordValidate({ email })

  //   if (error) {
  //     return res.status(400).json(this.response(400, error.message, null))
  //   }

  //   try {
  //     const result = await AuthService.forgetPassword(email)

  //     res.status(200).json(this.response(200, Message.SUCCESS, null))
  //   } catch (error) {
  //     res
  //       .status(error?.statusCode || 400)
  //       .json(this.response(error?.statusCode, error.message, null))
  //   }
  // }
}
