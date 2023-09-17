import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

// router.get('/',authorization(), pickHandler('DashBoardController@get'))
router.get(
  '/get-by-date-case',
  authorization(),
  pickHandler('DashBoardController@getCases')
)
router.get(
  '/get-by-date-response',
  authorization(),
  pickHandler('DashBoardController@getResponses')
)
router.get(
  '/view-all-customer-responsed',
  authorization(),
  pickHandler('DashBoardController@getCustomerResourceResponsed')
)

router.get(
  '/get',
  authorization(),
  pickHandler('DashBoardController@getCustomerAssign')
)
router.get(
  '/get-total',
  // authorization(),
  pickHandler('DashBoardController@getTotalCaseSend')
)
router.get(
  '/get-number',
  authorization(),
  pickHandler('DashBoardController@getTotalCaseStatus')
)

router.get(
  '/get-all',
  authorization(),
  pickHandler('DashBoardController@getTotalsendmail')
)
router.get(
  '/get-test',
  authorization(),
  pickHandler('DashBoardController@dashbroadCaseSum')
)
router.get(
  '/liststatus',
  authorization(),
  pickHandler('DashBoardController@dashbroadCase')
)
router.get(
  '/liststatususer',
  authorization(),
  pickHandler('DashBoardController@dashbroadCaseSumFlowUser')
)
router.get(
  '/listuser',
  authorization(),
  pickHandler('DashBoardController@totalCaseSendNumberWork')
)
router.get(
  '/listuserid',
  authorization(),
  pickHandler('DashBoardController@listUserAndId')
)
router.get(
  '/listuserflow',
  authorization(),
  pickHandler('DashBoardController@listPerformanceUser')
)

export default router
