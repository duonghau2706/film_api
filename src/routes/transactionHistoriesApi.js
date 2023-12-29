import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.post('/create', pickHandler('TransactionHistoriesController@create'))

export default router
