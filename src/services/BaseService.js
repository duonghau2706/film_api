import log4js from 'log4js'
import { TokenModel, UserModel } from '@/models'
import * as dotenv from 'dotenv'
dotenv.config()

const logger = log4js.getLogger()
class BaseService {
  constructor() {
    this.userModel = UserModel
    this.tokenModel = TokenModel
  }

  async compareToken(user_id, token) {
    let isCompareToken = false
    try {
      if (!user_id) {
        return false
      }

      // get current token for user
      const userData = await this.userModel.findOne({
        where: { id: user_id },
      })

      if (!userData) {
        return false
      }

      const qToken = await this.tokenModel.findOne({
        where: {
          user_id,
        },
      })

      if (token === qToken.token) {
        isCompareToken = true
      }
    } catch (error) {
      logger.error(
        'Error Current user did not login to the application or the session expired',
        error
      )
    }
    return isCompareToken
  }
}

export default new BaseService()
