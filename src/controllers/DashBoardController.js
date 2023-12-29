import DashBroadService, {
  default as getTotalAssign,
} from '@/services/DashBroadService'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import * as dotenv from 'dotenv'
import log4js from 'log4js'
import { verifyToken } from '@/helpers/token'
dotenv.config()
const logger = log4js.getLogger()

export default class DashBoardController {
  constructor() {
    this.response = ResponseUtils
  }

  async getAllDb(req, res) {
    try {
      const result = await DashBroadService.getAllDb(req)

      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)

      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }
}
