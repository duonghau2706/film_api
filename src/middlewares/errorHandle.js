import { Message } from '@/utils/Message'
import log4js from 'log4js'

const logger = log4js.getLogger()
const errorHandle = (err, req, res, next) => {
  console.log(err)
  let message = ''
  if (err.status == 401) {
    message = Message.ERROR_FORBIDDEN
  } else if (err.status == 403) {
    message = Message.ERROR_UNAUTHORIZED
  } else if (err.status == 500) {
    message = Message.SERVER_ERROR
  } else {
    message = Message.ERROR
  }
  logger.error('[Error errorHandle.]', err.message)
  res.status(err.status || 400).json({
    status: {
      message,
      code: err.status || 400,
      statusMessage: err.statusMessage || '',
    },
    data: null,
  })
}

export default errorHandle
