import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.post(
  '/update-status-member',
  pickHandler('UserController@updateStatusMember')
)

router.post('/get-user-by-email', pickHandler('UserController@getUserByEmail'))
router.get('/get', pickHandler('UserController@get'))
router.get('/get-profile', pickHandler('UserController@getProfile'))
router.get(
  '/get-transaction-histories',
  pickHandler('UserController@getTransactionHistories')
)

router.get('/getInfo', authorization(), pickHandler('UserController@get'))
// router.post('/update', authorization(), pickHandler('UserController@update'))

router.post(
  '/update-profile',
  authorization(),
  pickHandler('UserController@updateProfile')
)

// router.post(
//   '/update-profile',
//   authorization(),
//   pickHandler('UserController@updateProfile')
// )

router.post(
  '/update-account',
  authorization(),
  pickHandler('UserController@updateAccount')
)
router.post(
  '/update-list-movie',
  authorization(),
  pickHandler('UserController@updateListMovie')
)

router.post(
  '/create',
  authorization(),
  pickHandler('UserController@createUser')
)

router.post(
  '/update',
  authorization(),
  pickHandler('UserController@updateUser')
)

router.post(
  '/delete',
  authorization(),
  pickHandler('UserController@deleteUser')
)

router.post(
  '/get-reveneu',
  authorization(),
  pickHandler('UserController@getUserDb')
)

router.post(
  '/create-new-account',
  pickHandler('UserController@createNewAccount')
)

export default router
