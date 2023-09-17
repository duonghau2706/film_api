class ResponseUtils {
  constructor() {}

  response(code = 400, message = null, statusMessage = null, data = null) {
    const res = {
      status: {
        message,
        code,
        statusMessage,
      },
      data: data,
    }
    return res
  }
}

export default new ResponseUtils().response
