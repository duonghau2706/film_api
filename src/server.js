import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import api from '@/routes/api'
import systemConfig from 'config'
import errorHandle from '@/middlewares/errorHandle'
import log4js from '@/helpers/logger'
import { iniCron } from '@/helpers/scheduler'
import { connectionDB, importData } from '@/helpers/connection'
import http from 'http'
import path, { join } from 'path'
import session from 'express-session'
import ejs from 'ejs'

import * as dotenv from 'dotenv'
dotenv.config()

const logger = log4js.system
const app = express()
const server = http.createServer(app)
const whitelist = []

// setting host and port server
const HOSTNAME = systemConfig.get('hostname') || 'localhost'
const PORT = process.env.NODE_ENV === 'production' ? 4001 : 3000

// setting elasticsearch
// const { Client } = require('@elastic/elasticsearch')
// const elasticsearchClient = new Client({ node: 'http://localhost:9200' })

// init connect db
connectionDB()
// importData()
// config folder
app.use('/public', express.static(join(process.cwd(), 'assets')))
app.use(
  cors({
    exposedHeaders: ['Content-Disposition'],
  })
)

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set this to true on production
    },
  })
)

// config body data
app.use(bodyParser.urlencoded({ extended: false, limit: '25mb' }))
app.use(bodyParser.json({ limit: '25mb' }))
app.use(bodyParser.raw({ limit: '25mb' }))

// config api root
app.use('/api/v1', api)
app.use(errorHandle)

server.listen(PORT, HOSTNAME, () => {
  logger.info(`Server started running at ${HOSTNAME}:${PORT}`)
  iniCron()
})

export {}
