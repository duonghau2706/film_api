import { TokenModel, UserModel } from '@/models'
import { TokenRepository, UserRepository } from '@/repositories'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import log4js from 'log4js'
// import userMapper from '@/mapper/userMapper'
import { verifyTokenValidate } from '@/validations'
// import BaseService from './BaseService'
import { sendPasswordToMail } from '@/handlers/sendMail'
import { signToken, verifyToken } from '@/helpers/token'
import { sequelize } from '@/helpers/connection'
import { QueryTypes } from 'sequelize'
dotenv.config()

const logger = log4js.getLogger()
class AuthService {
  constructor() {
    this.response = ResponseUtils
    this.tokenModel = TokenModel
    this.userModel = UserModel
  }

  // async loginByMsTeams(tokenResponse) {
  //   try {
  //     const existedUser = await this.userModel.findOne({
  //       where: {
  //         email: tokenResponse.account.username,
  //       },
  //     })

  //     let user = existedUser

  //     //cập nhật field deleted = false nếu user đã tồn tại
  //     if (existedUser) {
  //       const payload = {
  //         data: { deleted: false },
  //         option: { id: existedUser?.id },
  //       }
  //       const dataUpdate = await UserRepository.update(payload).then(
  //         (res) => res?.[0]
  //       )
  //       user = dataUpdate
  //     }

  //     //Tạo user nếu chưa tồn tại
  //     else {
  //       user = await this.userModel.create({
  //         name: tokenResponse.account.name,
  //         email: tokenResponse.account.username,
  //         username: tokenResponse.account.username.split('@')[0],
  //       })
  //     }

  //     const existedToken = await this.tokenModel.findOne({
  //       where: {
  //         user_id: user.id,
  //       },
  //     })
  //     const expiresIn = 60 * 60 * 24 * 15

  //     const newToken = signToken(user, expiresIn)

  //     //Tạo token nếu chưa tồn tại
  //     if (!existedToken) {
  //       const token = await this.tokenModel.create({
  //         user_id: user.id,
  //         ms_teams_access_token: tokenResponse.accessToken,
  //         token: newToken,
  //       })
  //       return token
  //     }

  //     const payloadUpdate = {
  //       data: {
  //         token: newToken,
  //         ms_teams_access_token: tokenResponse.accessToken,
  //       },
  //       option: { id: existedToken.dataValues.id },
  //     }
  //     const token = await TokenRepository.update(payloadUpdate)
  //     return token[0]
  //   } catch (error) {
  //     throw error
  //   }
  // }

  async getAccessToken(user) {
    try {
      const existedToken = await this.tokenModel.findOne({
        where: {
          user_id: user.id,
        },
      })

      if (!existedToken) {
        throw {
          message: 'Access token do not exist',
          status: 400,
        }
      }

      return existedToken
    } catch (error) {
      throw error
    }
  }

  // [System] login
  async systemLogin(email, password) {
    logger.info('[System Login]')
    let responseData = {}
    try {
      const existedUser = await UserRepository.findOne({
        email: email,
        // status: true,
        deleted: false,
      }).then((res) => res?.dataValues)

      if (
        !existedUser ||
        !existedUser.password ||
        password != existedUser.password
      ) {
        logger.info('Wrong email or password.')
        throw {
          statusCode: 400,
          message: Message.WRONG_EMAIL_PASSWORD,
        }
      }
      // if (!existedUser?.status) {
      //   logger.info('This account inactive')
      //   throw {
      //     statusCode: 400,
      //     message: Message.ACCC_INACTIVE,
      //   }
      // }

      const qToken = await this.tokenModel.findOne({
        where: {
          user_id: existedUser.id,
        },
      })

      const expiresIn = 60 * 60 * 24
      const token = signToken(existedUser, expiresIn)
      if (!qToken) {
        // create new a record
        const payloadNew = {
          user_id: existedUser.id,
          token,
        }

        // save data to database
        await TokenRepository.create(payloadNew)
        return token
      }
      // update a record
      const tokenUser = qToken.dataValues
      tokenUser.token = token
      const payloadUpdate = {
        data: tokenUser,
        option: { id: tokenUser.id },
      }

      // save data to database
      await TokenRepository.update(payloadUpdate)
      return token
    } catch (error) {
      logger.error('[Error login]', error)
      throw error
      // return this.result(false, 400, Message.ERROR, null)
    }
  }

  // [Forget password]
  // async forgetPassword(email) {
  //   logger.info('[Forget password]')
  //   try {
  //     const existedUser = await UserRepository.findOne({
  //       email: email,
  //       deleted: false,
  //     }).then((res) => res?.dataValues)

  //     if (!existedUser) {
  //       logger.info('Wrong email or password.')
  //       throw {
  //         statusCode: 400,
  //         message: Message.USER_EXIST,
  //       }
  //     }

  //     const password = randomPassword()

  //     const payload = {
  //       to: email,
  //       subject: `[Asti] New password information`,
  //       content: `<p>[Asti] informs you that the new password form email account : ${email}</p> <p>Account: ${email}</p> <p>New Password: ${password}</p>`,
  //     }

  //     await sendPasswordToMail(payload)
  //     logger.info('send password to email success')

  //     const result = await this.userModel.update(
  //       { password: await bcrypt.hash(password, 10) },
  //       {
  //         where: {
  //           email,
  //         },
  //       }
  //     )
  //     return result
  //   } catch (error) {
  //     logger.error('[Error Forget password]', error)
  //     throw error
  //   }
  // }

  async logoutUser(req) {
    logger.info('[Logout User]')
    try {
    } catch (error) {
      logger.error('[Error Logout User]', error)
      return this.response(false, 400, Message.ERROR, null)
    }
    return this.response(true, 200, Message.SUCCESS, null)
  }

  // [verify token]
  async verifyToken(req, res) {
    const token = req.headers.authorization?.split(' ')?.[1]

    try {
      const { error } = verifyTokenValidate({ token })

      if (error) {
        throw {
          statusCode: 400,
          message: error.message,
        }
      }

      const decode = verifyToken(token)

      const isCompareToken = await BaseService.compareToken(decode.id, token)

      if (!isCompareToken) {
        throw {
          statusCode: 403,
          message: Message.ERROR_UNAUTHORIZED,
        }
      }

      const existedUser = await UserRepository.findOne({ id: decode.id }).then(
        (res) => res.dataValues
      )
      return userMapper.common(existedUser)
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        message: error.message,
      }
    }
  }

  async changePassword(email, password, newPassword) {
    try {
      const existedUser = await UserRepository.findOne({
        email: email,
        status: true,
      }).then((res) => res.dataValues)
      if (
        !existedUser ||
        !existedUser.password ||
        !bcrypt.compareSync(password, existedUser.password)
      ) {
        logger.info('Wrong email or password.')
        throw {
          statusCode: 500,
          message: Message.WRONG_PASSWORD,
        }
      }

      const payload = {
        data: {
          password: await bcrypt.hash(newPassword, 10),
        },
        option: { id: existedUser.id },
      }
      await UserRepository.update(payload)

      const qToken = await this.tokenModel.findOne({
        where: {
          user_id: existedUser.id,
        },
      })

      const expiresIn = 60 * 60 * 24 * 1

      const token = signToken(existedUser, expiresIn)

      if (!qToken) {
        // create new a record
        const payloadNew = {
          user_id: existedUser.id,
          token,
        }

        // save data to database
        await TokenRepository.create(payloadNew)
        return token
      }
      // update a record
      const tokenUser = qToken.dataValues
      tokenUser.token = token
      const payloadUpdate = {
        data: tokenUser,
        option: { id: tokenUser.id },
      }

      // save data to database
      await TokenRepository.update(payloadUpdate)
      return token
    } catch (error) {
      throw {
        statusCode: error.statusCode || 400,
        message: error.message,
      }
    }
  }
}
export default new AuthService()
