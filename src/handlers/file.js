import { toSlug } from '@/helpers/common'
import multer from 'multer'
import * as dotenv from 'dotenv'
import fs from 'fs'
import log4js from 'log4js'
const util = require('util')

const logger = log4js.getLogger()
dotenv.config()

const uploadSingleFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync(`${process.env.SERVER_STORAGE_URL}`, {
        recursive: true,
      })

      cb(null, `${process.env.SERVER_STORAGE_URL}`)
    },
    filename: function (req, file, cb) {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8'
      )
      const filePath = `${new Date().getTime()}_${toSlug(
        file.originalname.split('.')[0]
      )}.${file.originalname.split('.')[1]}`
      
      cb(null, filePath)
      file.originalname = filePath
      req.body.file = file
      req.body.file.filePath = `${filePath}`
    },
  })

  const upload = multer({ storage: storage }).single('file')

  return upload
}

const uploadMultiFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const { folder } = req.params
      fs.mkdirSync(`${process.env.SERVER_STORAGE_URL}${folder}`, {
        recursive: true,
      })
      cb(null, `${process.env.SERVER_STORAGE_URL}${folder}`)
    },
    filename: function (req, file, cb) {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString(
        'utf8'
      )
      const { folder } = req.params
      const filePath = `${new Date().getTime()}${toSlug(
        file.originalname.split('.')[0]
      )}.${file.originalname.split('.')[1]}`

      file.path = `${folder}/${filePath}`
      cb(null, filePath)
    },
  })

  const upload = multer({ storage: storage }).array('files', 10)

  return upload
}

const uploadFilesMiddleware = util.promisify(uploadMultiFile())

const deleteFile = (path) => {
  if (!fs.existsSync(`${process.env.SERVER_STORAGE_URL}${path}`)) {
    logger.error('File not exist')
    return
  }

  return fs.unlink(`${process.env.SERVER_STORAGE_URL}${path}`, (err) => {
    if (err) {
      logger.error('Delete File error.')
      throw err
    }

    logger.info('Delete File successfully.')
  })
}

const uploadFileSharePoint = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync(`${process.env.SERVER_STORAGE_URL}`, {
        recursive: true,
      })

      cb(null, `${process.env.SERVER_STORAGE_URL}`)
    },
    filename: function (req, file, cb) {
      file.originalname = file.originalname
      const filePath = `${file.originalname}`
      cb(null, filePath)
      req.body.file = file
      req.body.file.filePath = `/${filePath}`
    },
  })

  const upload = multer({ storage: storage }).single('file')
  return upload
}

const deleteFileSharepoint = (path) => {
  if (!fs.existsSync(`${process.env.SERVER_STORAGE_URL}${path}`)) {
    logger.error('File not exist')
    return
  }

  return fs.unlink(`${process.env.SERVER_STORAGE_URL}${path}`, (err) => {
    if (err) {
      logger.error('Delete File error.')
      throw err
    }

    logger.info('Delete File successfully.')
  })
}

export {
  deleteFile,
  uploadFilesMiddleware,
  uploadSingleFile,
  uploadFileSharePoint,
  deleteFileSharepoint,
}
