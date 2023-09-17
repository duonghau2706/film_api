import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.get('/get', authorization(), pickHandler('UserController@get'))
router.post('/update', authorization(), pickHandler('UserController@update'))
router.post(
  '/delete',
  authorization(),
  pickHandler('UserController@deleteById')
)

router.post(
  '/record-working-time',
  authorization(),
  pickHandler('UserController@recordWorkingTime')
)
router.get(
  '/view_all_effort_of_member',
  // authorization(),
  pickHandler('UserController@viewAllEffortOfMember')
)

export default router
