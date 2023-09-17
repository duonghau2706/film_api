import { uploadSingleFile } from '@/handlers/file'
import pickHandler from '@/helpers/routeHandler'
import { Router } from 'express'
const router = Router()

router.get('/dowload-file', pickHandler('FileController@download'))

router.post(
  '/upload-file/:folder',
  uploadSingleFile(),
  pickHandler('FileController@upload')
)

router.post(
  '/upload-multi-file/:folder',
  pickHandler('FileController@uploadMulti')
)

router.post(
  '/upload-file-share-point',
  uploadSingleFile(),
  pickHandler('SharepointController@uploadFile')
)
export default router
