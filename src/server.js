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
import { join } from 'path'
import session from 'express-session'

const msal = require('@azure/msal-node')

import * as dotenv from 'dotenv'
dotenv.config()

const msalConfig = {
  auth: {
    clientId: process.env.MS_TEAMS_CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority:
      process.env.MS_TEAMS_CLOUD_INSTANCE + process.env.MS_TEAMS_TENANT_ID, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: process.env.MS_TEAMS_CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message)
      },
      piiLoggingEnabled: false,
      logLevel: 'Info',
    },
  },
}

const msalInstance = new msal.ConfidentialClientApplication(msalConfig)
const cryptoProvider = new msal.CryptoProvider()

const logger = log4js.system
const app = express()
const server = http.createServer(app)
const whitelist = []

// setting host and port server
const HOSTNAME = systemConfig.get('hostname') || 'localhost'
const PORT = process.env.NODE_ENV === 'production' ? 4001 : 3000

// setting elasticsearch
const { Client } = require('@elastic/elasticsearch')
const elasticsearchClient = new Client({ node: 'http://localhost:9200' })

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

export { msalInstance, cryptoProvider, msalConfig, elasticsearchClient }
