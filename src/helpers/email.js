import log4js from 'log4js'
import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
dotenv.config()
const logger = log4js.getLogger()

export const sendMail = async (data) => {
  const smtpEndpoint = process.env.EMAIL_SMTP_ENDPOINT
  const port = process.env.EMAIL_SMTP_PORT
  const senderAddress = process.env.EMAIL_SENDER_ADDRESS
  const smtpUsername = process.env.EMAIL_SMTP_USERNAME
  const smtpPassword = process.env.EMAIL_SMTP_PASSWORD
  const toAddresses = data.email.toString()

  try {
    // logger.info('SendMail START!')

    // initialize a transporter to send mail
    const transporter = nodemailer.createTransport({
      // host: smtpEndpoint,
      // port: port,
      service: 'gmail',
      auth: {
        user: 'duonghau2706@gmail.com',
        pass: 'xykv efii pchv luf',
      },
    })

    // mail option, there are many other options like cc, bcc, ... you can refer to the link below
    let mailOptions = {
      from: 'duonghau2706@gmail.com',
      to: 'cuopbien123a7@gmail.com',
      subject: data.subject,
      html: data.content,
    }

    const info = await transporter.sendMail(mailOptions)
    // logger.info('Message sent! Message ID: ', info)
  } catch (error) {
    logger.error('Error send mail', error)
  } finally {
    // logger.info('SendMail END!')
  }
}
