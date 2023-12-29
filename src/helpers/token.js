import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import { Message } from '@/utils/Message'
dotenv.config()

const signToken = (existedUser, expiresIn) => {
  const token = jwt.sign(
    {
      id: existedUser.id,
      name: existedUser.name,
      email: existedUser.email,
      password: existedUser.password,
      gender: existedUser.gender,
      born: existedUser.born,
      phone: existedUser.phone,
      address: existedUser.address,
      money: existedUser.money,
      list_movie_id: existedUser.list_movie_id,
      service: existedUser.service,
      renewal_date: existedUser.renewal_date,
      bank_name: existedUser.bank_name,
      bank_account: existedUser.bank_account,
      role: existedUser.role,
      is_member: existedUser.is_member,
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
