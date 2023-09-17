import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.get('/get-all', authorization(), pickHandler('InquiryController@get'))

router.get(
  '/find-by-id',
  authorization(),
  pickHandler('InquiryController@findById')
)

export default router
