import pickHandler from '@/helpers/routeHandler'
import { authorization } from '@/middlewares/auth'
import { Router } from 'express'
const router = Router()

router.post(
  '/get-all',
  authorization(),
  pickHandler('MovieController@getAllMovie')
)

router.get(
  '/get-infor',
  authorization(),
  pickHandler('MovieController@getInforMovie')
)

router.post(
  '/create',
  authorization(),
  pickHandler('MovieController@createMovie')
)

router.post(
  '/single-movie',
  authorization(),
  pickHandler('MovieController@getAllSingleMovie')
)

router.post(
  '/series-movie',
  authorization(),
  pickHandler('MovieController@getAllSeriesMovie')
)

router.get(
  '/get-list-movie-by-list-movie-id',
  authorization(),
  pickHandler('MovieController@getListMovieByListMovieId')
)

router.get(
  '/list-episode',
  authorization(),
  pickHandler('MovieController@getListEpisode')
)

router.post(
  '/update-rate',
  authorization(),
  pickHandler('MovieController@updateRateMovie')
)

router.post(
  '/update-view',
  authorization(),
  pickHandler('MovieController@updateViewMovie')
)

router.post(
  '/update-movie',
  authorization(),
  pickHandler('MovieController@updateMovie')
)

router.post(
  '/delete',
  authorization(),
  pickHandler('MovieController@deleteMovie')
)

export default router
