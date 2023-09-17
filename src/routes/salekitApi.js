import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.post('/create', authorization(), pickHandler('SalekitController@create'))

router.put('/update', authorization(), pickHandler('SalekitController@update'))

router.delete(
  '/delete',
  authorization(),
  pickHandler('SalekitController@delete')
)

router.get(
  '/get-by-id',
  authorization(),
  pickHandler('SalekitController@getById')
)

router.get('/get', authorization(), pickHandler('SalekitController@get'))

router.get(
  '/get-categoties',
  authorization(),
  pickHandler('SalekitController@getCategories')
)

/* thống kê số lượng tài liệu theo từng mục 
(loại tài liệu, loại lưu trữ, domain, language) */
router.get(
  '/get-quantity',
  authorization(),
  pickHandler('SalekitController@getQuantityByType')
)

// lấy ra tài liệu nguồn
router.get(
  '/get-document-resource',
  authorization(),
  pickHandler('SalekitController@getDocumentResource')
)

// get HistoryDOcument
router.get(
  '/get-history',
  authorization(),
  pickHandler('SalekitController@getHistoryDocument')
)
export default router
