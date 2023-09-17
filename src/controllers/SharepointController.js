import { getAccessToken } from '@/handlers/sharepointApi'
import ResponseUtils from '@/utils/ResponseUtils'

import { deleteFileSharepoint } from '@/handlers/file'
import SharepointService from '@/services/SharepointService'
import { Message } from '@/utils/Message'
import * as dotenv from 'dotenv'
const fs = require('fs')

dotenv.config()

const { SERVER_STORAGE_URL } = process.env

export default class SharepointController {
  constructor() {
    this.response = ResponseUtils
  }

  //upload file with graph api
  async uploadFile(req, res) {
    const title = req.body.file.originalname
    const path = req.body.file.filePath
    const fileData = fs.readFileSync(`${SERVER_STORAGE_URL}${path}`)
    try {
      //lấy access_token
      const accessToken = await getAccessToken()

      const result = await SharepointService.uploadFile(
        fileData,
        accessToken,
        title
      )

      const newData = {
        idSharepoint: result?.id,
        fileName: title,
      }

      //xóa file đã lưu ở thư mục storage/
      deleteFileSharepoint(path)

      res.status(200).send({
        status: {
          message: Message.SUCCESS,
          code: 200,
          statusMessage: null,
        },
        data: newData,
      })
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    }
  }

  //download file
  async downloadFile(req, res) {
    const { fileId } = req.query
    try {
      //lấy access_token
      const accessToken = await getAccessToken()

      //kiểm tra xem fileId có tồn tại trên sharepoint không
      const checkFileId = await SharepointService.checkFileId(
        fileId,
        accessToken
      )

      if (checkFileId === 404) {
        res
          .status(404)
          .json(this.response(404, 'File không tồn tại trên sharepoint', null))
      }

      //download file
      const response = await SharepointService.downloadFile(fileId, accessToken)

      response?.data?.pipe(res)
    } catch (error) {
      res
        .status(error.statusCode)
        .json(this.response(error.statusCode, error.message, null))
    }
  }
}
