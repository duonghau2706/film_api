import pickHandler from '@/helpers/routeHandler'
import { Router } from 'express'
const router = Router()

router.post('', pickHandler('MailController@sendMailToNewUser'))

export default router
