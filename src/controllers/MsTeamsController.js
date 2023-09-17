import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import fetch from '@/handlers/msGraphApi'

import * as dotenv from 'dotenv'
import { AuthService } from '@/services'
import { verifyToken } from '@/helpers/token'
dotenv.config()

const logger = log4js.getLogger()

const GRAPH_ME_ENDPOINT = process.env.MS_TEAMS_GRAPH_API_ENDPOINT + 'v1.0/me'

const lOGIN_TYPE = {
  SUCCESS: 'success',
  FAILED: 'failed',
}

export default class MsTeamsController {
  constructor() {
    this.response = ResponseUtils
  }

  async signin(req, res, next) {
    const { state, tokenResponse } = req.body
    try {
      const token = await AuthService.loginByMsTeams(tokenResponse)

      res.redirect(
        `${state.redirectTo}?token=${token.token}&&loginType=${lOGIN_TYPE.SUCCESS}`
      )
    } catch (error) {
      logger.error('login failed:', error)
      res.redirect(`${state.redirectTo}?token=&&loginType=${lOGIN_TYPE.FAILED}`)
    }
  }

  async signout(req, res) {
    try {
    } catch (error) {}
  }

  async getProfile(req, res, next) {
    const decode = verifyToken(req)
    try {
      const token = await AuthService.getAccessToken(decode)
      const graphResponse = await fetch(
        GRAPH_ME_ENDPOINT,
        token.msTeamsAccesstoken
      )
      return res.status(200).json(this.response(200, 'success', graphResponse))
    } catch (error) {
      return res.status(400).json(this.response(400, error.message, null))
    }
  }
}
