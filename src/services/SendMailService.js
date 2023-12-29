import log4js from 'log4js'

import * as dotenv from 'dotenv'

import ResponseUtils from '@/utils/ResponseUtils'
import nodemailer from 'nodemailer'

dotenv.config()

const logger = log4js.getLogger()
class SendMailService {
  constructor() {
    this.result = ResponseUtils
  }
  async sendUser({ email, password }) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>auth</title>
    <style>
      body {
        font-size: 18px;
      }
      header {
        margin-bottom: 10px;
      }

      footer {
        margin-top: 10px;
      }

      .pw {
        padding: 8px 12px;
        width: '700px';
        position: relative;
        left: 300px;
        font-weight: bold;
        font-size: 30px;
      }
    </style>
  </head>
  <body>
    <header>Gửi bạn,</header>
    <span
      >Chúng tôi nhận được 1 yêu cầu đăng kí tài khoản mới trên trang sansan từ
      email của bạn. Mật khẩu của bạn là:
    </span>
    <div class="pw">${password}</div>
    <span>Nếu bạn không đăng kí tài khoản có thể bỏ qua thông báo này.</span>
    <strong>Nghiêm cấm đưa mật khẩu này cho bất kì ai.</strong>
    <footer>Trân trọng!</footer>
  </body>
</html>

`

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        // requireTLS: true,
        auth: {
          user: 'sansanmovies@gmail.com',
          pass: 'ozqtgjhkerdxudsc',
        },
      })

      // mail option, there are many other options like cc, bcc, ... you can refer to the link below
      let mailOptions = {
        from: 'sansanmovies@gmail.com',
        to: email,
        subject: 'Xác thực đăng kí tài khoản',
        text: password,
        html: htmlContent,
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }
      })

      logger.info(`send mail to: ${email} successful`)
    } catch (error) {
      logger.error(`send mail err: ${error}`)
      throw error
    }
  }
}

export default new SendMailService()
