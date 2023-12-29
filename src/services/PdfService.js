import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import { Message } from '@/utils/Message'

import * as dotenv from 'dotenv'
import { UserModel, EffortMemberModel, CustomerModel } from '@/models'
import { Op, QueryTypes } from 'sequelize'
import camelcaseKeys from 'camelcase-keys'
import {
  TokenRepository,
  UserRepository,
  EffortMemberRepository,
} from '@/repositories'
import { cleanObj } from '@/helpers/obj'
import moment from 'moment'
import { sequelize } from '@/helpers/connection'

import puppeteer from 'puppeteer'
import Fs from 'fs'
import Path, { dirname } from 'path'
import Util from 'util'
const ReadFile = Util.promisify(Fs.readFile)

dotenv.config()

const logger = log4js.getLogger()
class UserService {
  constructor() {
    this.userModel = UserModel
    this.customerModel = CustomerModel
    this.result = ResponseUtils
    this.effortMemberModel = EffortMemberModel
    this.customerModel = CustomerModel
  }

  async html() {
    try {
      const htmlPath = Path.join(__dirname, '../view/html/renderPdf.html')
      const content = await ReadFile(htmlPath, 'utf8')
      return content
    } catch (err) {
      console.log('Cannot read html file')
    }
  }

  // async renderEjs(req, res, data) {
  //   const filePath = path.join(__dirname, '..', 'view', 'print.ejs')
  //   ejs.renderFile(filePath, { data: data }, (err, data) => {
  //     if (err) {
  //       return res.send('Loi roi huhu')
  //     }

  //     return res.send(data)
  //   })
  // }

  async getPdf(req, res) {
    console.log('req?.body', req?.body)
    const contentHtml = req?.body?.contentHtml
    console.log('contentHtml', contentHtml)
    // const listPaymentUser = req?.body?.listPaymentUser
    try {
      const data = await this.html()
      console.log('data', data)
      //   this.html().then(async (data) => {
      // const data = await this.renderEjs(req, res, listPaymentUser)

      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })

      const convertPage = await browser.newPage()

      // await convertPage.goto('http://localhost:3000/api/v1/render-ejs', {
      //   waitUntil: 'networkidle0',
      // })

      // Lưu nội dung của TypeScript vào một file tạm thời
      // const tempFilePath = Path.join(__dirname, '../view/html/exam.tsx')
      // await Fs.promises.writeFile(tempFilePath, tsxContent)

      // await require('typescript').transpileModule(tsxContent)
      // await page.goto(`file://${tempFilePath}`, { waitUntil: 'networkidle0' })

      // await convertPage.goto(
      //   'http://127.0.0.1:5500/film_api/src/view/html/renderPdf.html',
      //   { waitUntil: 'load' }
      // )
      // const url = 'http://127.0.0.1:5500/film_api/src/view/html/renderPdf.html'
      // await convertPage.goto(url, { waitUntil: 'load' })
      await convertPage.setContent(contentHtml)
      // Điều hướng đến trang web cần chụp ảnh
      // await convertPage.goto('https://neu.edu.vn')

      // Chụp ảnh và lưu vào một tệp
      // await convertPage.screenshot({ path: 'example.png' })

      // Đóng trình duyệt
      // await browser.close()
      // const jsContent = transpile(tsxContent, {
      //   compilerOptions: { module: 'commonjs' },
      // })

      // await convertPage.setContent(
      //   `<script type="module">${jsContent}</script>`,
      //   {
      //     waitUntil: 'networkidle0',
      //   }
      // )

      const pdfBuffer = await convertPage.pdf({
        format: 'A4',
        width: '21cm',
        height: '29.7cm',
        printBackground: true,
        margin: {
          bottom: '80px',
          top: '60px',
        },
      })

      // const pdfBuffer = await convertPage.pdf({
      //   format: 'Letter',
      //   printBackground: true,
      // })

      // res.set('Content-Type', 'application/pdf')
      // res.send(pdfBuffer)
      // console.log(
      //   'Buffer.from(pdfBuffer, "binary")',
      //   Buffer.from(pdfBuffer, 'binary')
      // )
      await browser.close()

      return Buffer.from(pdfBuffer, 'binary')
      // return pdfBuffer

      // res.set('Content-Type', 'application/pdf')
      //   return this.result(
      //     200,
      //     true,
      //     Message.SUCCESS,
      //     Buffer.from(pdfBuffer, 'binary')
      //   )

      //   res.status(201).send(Buffer.from(pdfBuffer, 'binary'))
    } catch (error) {
      //   )}
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }
}

export default new UserService()
