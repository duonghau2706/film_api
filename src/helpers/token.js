import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { Message } from '@/utils/Message'
dotenv.config()

const signToken = (existedUser, expiresIn) => {
  const token = jwt.sign(
    {
      id: existedUser.id,
      name: existedUser.name,
      username: existedUser.username,
      email: existedUser.email,
      gender: existedUser.gender,
      phoneNumber: existedUser.phoneNumber,
      address: existedUser.address,
      role: existedUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  )
  return token
}

const verifyToken = (req) => {
  const token = req.headers.authorization?.split(' ')?.[1]
  return jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) {
      throw {
        statusCode: 403,
        message: Message.ERROR_UNAUTHORIZED,
      }
    }
    return decode
  })
}

export { signToken, verifyToken }
