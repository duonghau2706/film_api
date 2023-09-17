import pickHandler from '@/helpers/routeHandler'
import { Router } from 'express'
const router = Router()

router.get('/download-file', pickHandler('SharepointController@downloadFile'))

export default router
