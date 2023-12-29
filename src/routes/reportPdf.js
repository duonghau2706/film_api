import pickHandler from '@/helpers/routeHandler'
import { Router } from 'express'
import ejs from 'ejs'
const router = Router()

router.post('/pdf', pickHandler('PdfController@getReport'))

export default router
