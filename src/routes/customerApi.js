import { Router } from 'express'
import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
const router = Router()

router.post(
  '/create',
  authorization(),
  pickHandler('CustomerController@create')
)

router.get(
  '/get',
  //  authorization(),
  pickHandler('CustomerController@get')
)

router.post(
  '/update',
  // authorization(),
  pickHandler('CustomerController@update')
)

router.post(
  '/delete',
  authorization(),
  pickHandler('CustomerController@delete')
)

router.post(
  '/get-by-id',
  authorization(),
  pickHandler('CustomerController@getById')
)

router.post(
  '/create-by-excel',
  authorization(),
  pickHandler('CustomerController@createByExcel')
)

router.post(
  '/upadte-customer-by-user',
  authorization(),
  pickHandler('CustomerController@asignCustomerByUser')
)

router.post(
  '/update-frequency-by-email',
  authorization(),
  pickHandler('CustomerController@updateFrequencyEmail')
)

router.post(
  '/update-status-sending',
  authorization(),
  pickHandler('CustomerController@updateStatusSending')
)

router.get(
  '/view-detail-history',
  // authorization(),
  pickHandler('CustomerController@getHistoybyEmail')
)
router.post(
  '/check-import-name-customer',
  // authorization(),
  pickHandler('CustomerController@checkListNameCustomerIsExist')
)

router.get(
  '/map-elasticsearch',
  // authorization(),
  pickHandler('CustomerController@mapTableToIndex')
)

router.get(
  '/search-elasticsearch',
  // authorization(),
  pickHandler('CustomerController@searchTitles')
)

router.get(
  '/config-max-result',
  // authorization(),
  pickHandler('CustomerController@configureMaxResultWindow')
)

router.get(
  '/get-all',
  authorization(),
  pickHandler('CustomerController@getAll')
)

export default router
