import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.post(
  '/create',
  authorization(),
  pickHandler('TemplateController@create')
)

router.post(
  '/update',
  authorization(),
  pickHandler('TemplateController@update')
)

router.get(
  '/find-by-id',
  authorization(),
  pickHandler('TemplateController@findById')
)

router.post(
  '/delete-by-id',
  authorization(),
  pickHandler('TemplateController@deleteById')
)
router.post(
  '/change-status',
  authorization(),
  pickHandler('TemplateController@changeStatus')
)

router.get('/find-all', authorization(), pickHandler('TemplateController@get'))

export default router
