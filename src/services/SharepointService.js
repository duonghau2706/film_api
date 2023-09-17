import ResponseUtils from '@/utils/ResponseUtils'
import axios from 'axios'
import * as dotenv from 'dotenv'

dotenv.config()

const { DRIVE_ID, SITE_ID } = process.env

class SharepointService {
  constructor() {
    this.result = ResponseUtils
  }

  async uploadFile(fileData, accessToken, title) {
    try {
      const endPoint = `https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/${title}:/content`
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
      const response = await axios.put(endPoint, fileData, config)
      return response?.data
    } catch (error) {
      throw new Error(error)
    }
  }

  async checkFileId(param, accessToken) {
    //url check file id
    const endPoint = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drive/items/${param}`

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    }
    try {
      const response = await axios.get(endPoint, { headers: headers })
      return response?.data
    } catch (error) {
      return error?.response?.status
    }
  }

  async downloadFile(param, accessToken) {
    //url check file id
    const endPoint = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives/${DRIVE_ID}/items/${param}/content`

    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'stream',
    }
    try {
      const response = await axios.get(endPoint, config)
      return response
    } catch (error) {
      throw new Error(error)
    }
  }
}

export default new SharepointService()
