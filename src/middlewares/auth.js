import jwt, { TokenExpiredError } from 'jsonwebtoken'
import createError from 'http-errors'
import { BaseService } from '@/services'
import systemConfig from 'config'
import { Message } from '@/utils/Message'
import log4js from 'log4js'

const logger = log4js.getLogger()
export const authorization = () => async (req, res, next) => {
  try {
    if (!req.headers || !req.headers.authorization) {
      throw createError(403, Message.ERROR_UNAUTHORIZED)
    }

    let token = req.headers.authorization
    if (token.startsWith('Bearer ')) {
      token = token.substring(7, token.length)
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        throw {
          status: 403,
          message: Message.ERROR_UNAUTHORIZED,
        }
      }
      return decode
    })
    const isCompareToken = await BaseService.compareToken(decode.id, token)

    if (!isCompareToken) {
      throw {
        status: 403,
        message: Message.ERROR_UNAUTHORIZED,
      }
    }

    next()
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      err.status = 403
    }
    next(err)
  }
}

export const decryptToken = (req) => {
  let token = req.headers.authorization
  if (!token) {
    return null
  }

  if (token.startsWith('Bearer ')) {
    token = token.substring(7, token.length)
  }

  const decode = jwt.verify(
    token,
    systemConfig.get('jwt.secret') || 'Amatrium#secretKey'
  )

  if (!decode) {
    return null
  }

  return decode.payload
}
