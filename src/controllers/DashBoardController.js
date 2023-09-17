import { default as getTotalAssign } from '@/services/DashBroadService'
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

  async getCustomerAssign(req, res) {
    try {
      const result = await getTotalAssign.getCustomerAssignMent(req)
      const data = {
        ...result,
        Message: res.status,
      }

      res.status(200).json(this.response(200, Message.SUCCESS, data))
    } catch (error) {
      logger.error(error)

      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }

  async getTotalCaseSend(req, res) {
    try {
      const data = await getTotalAssign.getTotalCaseSend(req)

      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null))
    }
  }
  async getTotalCaseStatus(req, res) {
    try {
      const result = await getTotalAssign.getTotalCaseStatus(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null))
    }
  }
  async getTotalsendmail(req, res) {
    try {
      const result = await getTotalAssign.getTotalsendmail(req)
      const data = {
        ...result,
        mess: 'thành công',
      }
      res.status(200).json(this.response(200, Message.SUCCESS, null, data))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }
  // code lại case 13

  async dashbroadCaseSum(req, res) {
    try {
      const result = await getTotalAssign.dashbroadCaseSum(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }
  // case 14: lấy dữ liệu theo từng nguồn
  async dashbroadCaseSumFlowUser(req, res) {
    try {
      const decode = verifyToken(req)
      const result = await getTotalAssign.dashbroadCaseSumFlowUser(req, decode)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }

  async dashbroadCase(req, res) {
    try {
      const result = await getTotalAssign.dashbroadCase(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }
  async listUserAndId(req, res) {
    try {
      const result = await getTotalAssign.listUserAndId(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }
  async listPerformanceUser(req, res) {
    try {
      const result = await getTotalAssign.listPerformanceUser(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }
  async totalCaseSendNumberWork(req, res) {
    console.log('req', req.query)
    try {
      const result = await getTotalAssign.totalCaseSendNumberWork(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      logger.error(error)
      res.status(500).json(this.response(500, Message.ERROR, null, null))
    }
  }
  // haund
  async getCases(req, res) {
    // console.log('req.queryyyy', req.query)

    try {
      const result = await getTotalAssign.getCases(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async getResponses(req, res) {
    // console.log('req.queryyyy', req.query)

    try {
      const result = await getTotalAssign.getResponses(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }

  async getCustomerResourceResponsed(req, res) {
    // console.log('quyry', req.query)

    try {
      const result = await getTotalAssign.getCustomerResourceResponsed(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, result))
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    } finally {
    }
  }
}
