import * as dotenv from 'dotenv'
dotenv.config()
import { sendMail } from '@/helpers/email'

const sendPasswordToMail = async (data) => {
  const dataSendMail = {
    email: data.to, // Gửi đến ai?
    subject: data.subject, // Tiêu đề email
    content: data.content, // Nội dung email`<p>Password: 1111</p>`
  }
  await sendMail(dataSendMail)
}

export { sendPasswordToMail }
