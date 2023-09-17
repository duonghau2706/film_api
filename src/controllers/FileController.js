import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import * as dotenv from 'dotenv'
import { uploadFilesMiddleware } from '@/handlers/file'

const fs = require('fs')
const path = require('path')

dotenv.config()

const logger = log4js.getLogger()
export default class FileController {
  constructor() {
    this.response = ResponseUtils
  }
  async download(req, res, next) {
    const { path } = req.query
    try {
      res.download(`${process.env.SERVER_STORAGE_URL}${path}`)
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode || 400), error?.message, null)
    } finally {
    }
  }

  async upload(req, res, next) {
    try {
      res.status(200).send({
        status: {
          message: 'success',
          code: 200,
          statusMessage: null,
        },
        data: {
          fileName: req.body.file.originalname,
          path: req.body.file.filePath,
        },
      })
    } catch (error) {
      res
        .status(error?.statusCode || 400)
        .json(this.response(error?.statusCode || 400), error?.message, null)
    } finally {
    }
  }

  async uploadMulti(req, res, next) {
    const { folder } = req.params

    await uploadFilesMiddleware(req, res)
    try {
      const params = req.files.map((item) => {
        return {
          path: `${folder}/${item.filename}`,
          fileName: item.originalname,
        }
      })
      res.status(200).send({
        status: {
          message: 'success',
          code: 200,
          statusMessage: null,
        },
        data: params,
      })
    } catch (error) {
      res.status(error?.statusCode || 400).send({
        status: {
          message: error?.message,
          code: error?.statusCode || 400,
          statusMessage: null,
        },
      })
    } finally {
    }
  }
}
