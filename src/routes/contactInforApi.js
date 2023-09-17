import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.get('/get', authorization(), pickHandler('ContactInforController@get'))

router.post(
  '/update',
  authorization(),
  pickHandler('ContactInforController@update')
)

router.get(
  '/find-by-id',
  authorization(),
  pickHandler('ContactInforController@findById')
)

export default router
