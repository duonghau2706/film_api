import { Router } from 'express'
import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
const router = Router()

router.post('/customers', pickHandler('MailController@sendMailToCustomers'))

router.get('/get-all', authorization(), pickHandler('MailController@get'))

router.get(
  '/find-by-id',
  authorization(),
  pickHandler('MailController@findById')
)

router.post('/update', authorization(), pickHandler('MailController@update'))

export default router
