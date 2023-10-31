import express from 'express'

import contactInforRouter from './contactInforApi'
import sharepointRouter from './sharepointApi'
import customerRouter from './customerApi'
import CustomerResourceRouter from './customerResourceApi'
import helperRouter from './helperApi'
import inquiryApi from './inquiryApi'
import msTeamsRouter from './msTeamsApi'
import loginRouter from './loginApi'
import sendMailRouter from './sendMailApi'
import templateRouter from './templateApi'
import userRouter from './userApi'
import dashBoardRouter from './dashBoardApi'
import salekitRouter from './salekitApi'

const router = express.Router()

router.use('', helperRouter)
router.use('/ms-teams', msTeamsRouter)
router.use('/login', loginRouter)
router.use('/template', templateRouter)
router.use('/customer', customerRouter)
router.use('/inquiry', inquiryApi)
router.use('/send-mail', sendMailRouter)
router.use('/customer-resource', CustomerResourceRouter)
router.use('/user', userRouter)
router.use('/contact-infor', contactInforRouter)
router.use('/sharepoint', sharepointRouter)
router.use('/dash-board', dashBoardRouter)
router.use('/salekit', salekitRouter)

export default router
