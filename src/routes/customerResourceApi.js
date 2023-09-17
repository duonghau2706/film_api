import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.post(
  '/create',
  authorization(),
  pickHandler('CustomerResourceController@create')
)

router.post(
  '/update',
  authorization(),
  pickHandler('CustomerResourceController@update')
)

router.get(
  '/find-by-id',
  authorization(),
  pickHandler('CustomerResourceController@findById')
)

router.post(
  '/delete-by-id',
  authorization(),
  pickHandler('CustomerResourceController@deleteById')
)

router.get(
  '/find-all',
  authorization(),
  pickHandler('CustomerResourceController@get')
)

router.get(
  '/get-customer-of-resource',
  authorization(),
  pickHandler('CustomerResourceController@getCustomerOfResource')
)

router.get(
  '/get-history-send-mail',
  authorization(),
  pickHandler('CustomerResourceController@getHistorySendMail')
)

router.get(
  '/get-customer-of-resource-sent',
  authorization(),
  pickHandler('CustomerResourceController@getCustomerOfResourceSent')
)

router.get(
  '/get-history-import-customer',
  authorization(),
  pickHandler('CustomerResourceController@getHistoryImportCustomer')
)

router.get(
  '/get-detail-history-import-customer',
  authorization(),
  pickHandler('CustomerResourceController@getDetailHistoryImportCustomer')
)

export default router
