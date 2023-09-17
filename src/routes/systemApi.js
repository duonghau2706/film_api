import { Router } from 'express'
import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
const router = Router()

// =====================================Auth==========================================

router.post('/login', pickHandler('AuthController@systemLogin'))
router.post('/forget-password', pickHandler('AuthController@forgetPassword'))
// =====================================CMS==========================================
export default router
