import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import { Message } from '@/utils/Message'
import { element as elementPaginate } from '@/helpers/paginate'

import * as dotenv from 'dotenv'
import { UserModel, EffortMemberModel, CustomerModel } from '@/models'
import { Op, QueryTypes } from 'sequelize'
import camelcaseKeys from 'camelcase-keys'
import {
  TokenRepository,
  UserRepository,
  EffortMemberRepository,
} from '@/repositories'
import { cleanObj } from '@/helpers/obj'
import moment from 'moment'
import { sequelize } from '@/helpers/connection'

dotenv.config()

const logger = log4js.getLogger()
class MovieService {
  constructor() {
    this.result = ResponseUtils
  }

  async getListMovieByListMovieId(req) {
    const listMovieId = req?.query?.listMovieId

    try {
      //user khong co phim nao trong ds phat
      if (!listMovieId) {
        return this.result(200, true, Message.SUCCESS)
      }

      const listInfor = `select * from movie where id in ('${listMovieId}')`
      const getListMovieByListMovieId = await sequelize.query(listInfor, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, getListMovieByListMovieId)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getAllSingleMovie(req) {
    const category = req?.body?.category

    try {
      const allSingleMovie = "select * from movie where TYPE = 'single'"

      const getAllSingleMovie = await sequelize.query(allSingleMovie, {
        type: QueryTypes.SELECT,
      })

      const singleMovieTrending = category
        ? `select * from movie where TYPE = 'single' and category like '%${category}%' order by view_of_month desc`
        : "select * from movie where TYPE = 'single' order by view_of_month desc"

      const getAllSingleMovieTrending = await sequelize.query(
        singleMovieTrending,
        {
          type: QueryTypes.SELECT,
        }
      )

      const singleMovieTop = category
        ? `select * from movie where TYPE = 'single' and category like '%${category}%' order by view_of_day desc limit 10`
        : "select * from movie where TYPE = 'single' order by view_of_day desc limit 10"

      const getAllSingleMovieTop = await sequelize.query(singleMovieTop, {
        type: QueryTypes.SELECT,
      })

      const singleMovieRate = category
        ? `select * from movie where TYPE = 'single' and category like '%${category}%' order by avg_rated desc`
        : "select * from movie where TYPE = 'single' order by avg_rated desc"

      const getAllSingleMovieRate = await sequelize.query(singleMovieRate, {
        type: QueryTypes.SELECT,
      })

      const singleMovieView = category
        ? `select * from movie where TYPE = 'single' and category like '%${category}%' order by view desc`
        : "select * from movie where TYPE = 'single' order by view desc"

      const getAllSingleMovieView = await sequelize.query(singleMovieView, {
        type: QueryTypes.SELECT,
      })

      const singleMovieCartoon = category
        ? `select * from movie where TYPE = 'single' and category like '%${category}%' and category like '%Hoạt Hình%'`
        : "select * from movie where TYPE = 'single' and category like '%Hoạt Hình%'"

      const getAllSingleMovieCartoon = await sequelize.query(
        singleMovieCartoon,
        {
          type: QueryTypes.SELECT,
        }
      )

      const movieDataRes = {
        trending: getAllSingleMovieTrending,
        top: getAllSingleMovieTop,
        rate: getAllSingleMovieRate,
        view: getAllSingleMovieView,
        cartoon: getAllSingleMovieCartoon,
      }

      return this.result(200, true, Message.SUCCESS, movieDataRes)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getAllSeriesMovie(req) {
    const category = req?.body?.category
    try {
      const allSeriesMovie = "select * from movie where TYPE = 'series'"

      const getAllSeriesMovie = await sequelize.query(allSeriesMovie, {
        type: QueryTypes.SELECT,
      })

      const seriesMovieTrending = category
        ? `select * from movie where TYPE = 'series' and category like '%${category}%' order by view_of_day desc`
        : "select * from movie where TYPE = 'series' order by view_of_month desc"

      const getAllSeriesMovieTrending = await sequelize.query(
        seriesMovieTrending,
        {
          type: QueryTypes.SELECT,
        }
      )

      const seriesMovieTop = category
        ? `select * from movie where TYPE = 'series' and category like '%${category}%' order by view_of_day desc limit 10`
        : "select * from movie where TYPE = 'series' order by view_of_day desc limit 10"

      const getAllSeriesMovieTop = await sequelize.query(seriesMovieTop, {
        type: QueryTypes.SELECT,
      })

      const seriesMovieRate = category
        ? `select * from movie where TYPE = 'series' and category like '%${category}%' order by avg_rated desc`
        : "select * from movie where TYPE = 'series' order by avg_rated desc"

      const getAllSeriesMovieRate = await sequelize.query(seriesMovieRate, {
        type: QueryTypes.SELECT,
      })

      const seriesMovieView = category
        ? `select * from movie where TYPE = 'series' and category like '%${category}%' order by view desc`
        : "select * from movie where TYPE = 'series' order by view desc"

      const getAllSeriesMovieView = await sequelize.query(seriesMovieView, {
        type: QueryTypes.SELECT,
      })

      const seriesMovieCartoon = category
        ? `select * from movie where TYPE = 'series' and category like '%${category}%' and category like '%Hoạt Hình%'`
        : "select * from movie where TYPE = 'series' and category like '%Hoạt Hình%'"

      const getAllSeriesMovieCartoon = await sequelize.query(
        seriesMovieCartoon,
        {
          type: QueryTypes.SELECT,
        }
      )

      const movieDataRes = {
        trending: getAllSeriesMovieTrending,
        top: getAllSeriesMovieTop,
        rate: getAllSeriesMovieRate,
        view: getAllSeriesMovieView,
        cartoon: getAllSeriesMovieCartoon,
      }

      return this.result(200, true, Message.SUCCESS, movieDataRes)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getAllMovie(req) {
    const limitInput = req?.body?.perPage
    const pageInput = req?.body?.currentPage
    const idMovie = req?.body?.idMovie
    const countryMovie = req?.body?.countryMovie
    const categoryMovie = req?.body?.categoryMovie
    const typeMovie = req?.body?.typeMovie
    const episodeTotalMovie = req?.body?.episodeTotalMovie
    const timeMovie = req?.body?.timeMovie
    const enteredStartDatetMovie = req?.body?.enteredStartDatetMovie
    const enteredEndDateMovie = req?.body?.enteredEndDateMovie

    try {
      let allMovie = 'select * from movie where 1=1'

      if (idMovie) {
        allMovie += ` and id = '${idMovie}'`
      }

      if (countryMovie) {
        allMovie += ` and country = '${countryMovie}'`
      }

      if (categoryMovie) {
        allMovie += ` and category like '%${categoryMovie}%'`
      }

      if (typeMovie) {
        allMovie += ` and type = '${typeMovie}'`
      }

      if (episodeTotalMovie) {
        allMovie += ` and episode_total = ${episodeTotalMovie}`
      }

      if (timeMovie) {
        allMovie += ` and time = ${timeMovie}`
      }

      if (enteredStartDatetMovie && enteredEndDateMovie) {
        allMovie += ` and created_at between '${enteredStartDatetMovie}' and '${enteredEndDateMovie}'`
      }

      allMovie += ' order by updated_at desc'

      let getAllMovie = await sequelize.query(allMovie, {
        type: QueryTypes.SELECT,
      })
      let totalPageRes = 1
      let pageRes = pageInput
      let total = getAllMovie?.length

      if (limitInput || pageInput) {
        const { totalPage, page, offset } = elementPaginate({
          totalRecord: getAllMovie?.length,
          page: pageInput,
          limit: limitInput,
        })

        totalPageRes = totalPage
        pageRes = page
        getAllMovie = await sequelize.query(
          allMovie + ` LIMIT ${limitInput} OFFSET ${offset}`,
          { type: QueryTypes.SELECT }
        )
      }

      const movieTrending = 'select * from movie order by view_of_month desc'

      const getAllMovieTrending = await sequelize.query(movieTrending, {
        type: QueryTypes.SELECT,
      })

      const movieTop = 'select * from movie order by view_of_day desc limit 10'

      const getAllMovieTop = await sequelize.query(movieTop, {
        type: QueryTypes.SELECT,
      })

      const movieRate = 'select * from movie order by avg_rated desc'

      const getAllMovieRate = await sequelize.query(movieRate, {
        type: QueryTypes.SELECT,
      })

      const movieView = 'select * from movie order by view desc'

      const getAllMovieView = await sequelize.query(movieView, {
        type: QueryTypes.SELECT,
      })

      const movieCartoon =
        "select * from movie where category like '%Hoạt Hình%'"

      const getAllMovieCartoon = await sequelize.query(movieCartoon, {
        type: QueryTypes.SELECT,
      })

      const movieDataRes = {
        all: getAllMovie,
        trending: getAllMovieTrending,
        top: getAllMovieTop,
        rate: getAllMovieRate,
        view: getAllMovieView,
        cartoon: getAllMovieCartoon,
        pagination: {
          totalPageRes: +totalPageRes,
          pageRes: +pageRes,
          total: +total,
        },
      }

      return this.result(200, true, Message.SUCCESS, movieDataRes)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getListEpisode(req) {
    const movieId = req.query.id
    try {
      const listEpisode = `select * from movie where id = '${movieId}'`
      const getListEpisode = await sequelize.query(listEpisode, {
        type: QueryTypes.SELECT,
      })
      return this.result(200, true, Message.SUCCESS, getListEpisode)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getInforMovieByMovieId(req) {
    const movieId = req?.query?.movieId
    try {
      const inforMovie = `select * from movie where id = '${movieId}'`

      const getInforMovieByMovieId = await sequelize.query(inforMovie, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, getInforMovieByMovieId)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateRateMovie(req) {
    const movieId = req.body.id
    const listRated = req.body.list_rated
    const avgRated = req.body.avg_rated
    const numeberOfRated = req.body.number_of_rated
    const currentRated = req.body.current_rated
    try {
      const rateMovie = `update movie set current_rated = ${currentRated}, list_rated = '${listRated}', number_of_rated = ${numeberOfRated}, avg_rated = ${avgRated} where id = '${movieId}'`
      const updateRate = await sequelize.query(rateMovie, {
        type: QueryTypes.SELECT,
      })

      const inforMovie = `select * from movie where id = '${movieId}'`
      const getInforMovie = await sequelize.query(inforMovie, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, getInforMovie)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateViewMovie(req) {
    const movieId = req.body.id
    const view = req.body.view
    const view_of_day = req.body.view_of_day
    const view_of_month = req.body.view_of_month

    try {
      const viewMovie = `update movie set view_of_day = ${view_of_day}, view_of_month = ${view_of_month}, view = ${view} where id = '${movieId}'`
      const updateView = await sequelize.query(viewMovie, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, updateView)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async updateMovie(req) {
    const {
      id,
      name,
      type,
      category,
      url,
      poster_url,
      country,
      time,
      actor,
      episode_total,
      content,
      publish,
      admin_id,
      updated_at,
      update_by,
    } = req?.body

    try {
      const movieSql = `update movie set name='${name}', type='${type}', category='${category}', url='${url}', poster_url='${poster_url}', country='${country}', time=${time}, actor='${actor}', episode_total=${episode_total}, content='${content}', publish='${publish}', admin_id='${admin_id}', updated_at='${updated_at}', updated_by='${update_by}' where id='${id}'`

      const updateMovie = await sequelize.query(movieSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, updateMovie)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async createMovie(req) {
    const {
      id,
      name,
      type,
      category,
      url,
      poster_url,
      country,
      time,
      actor,
      episode_total,
      content,
      publish,
      admin_id,
      created_by,
      created_at,
      updated_at,
    } = req.body

    try {
      const movieSql = `insert into movie (id, name, type, category, url, poster_url, country, time, actor, episode_total, content, publish, admin_id, created_by, created_at, updated_at) values('${id}', '${name}', '${type}', '${category}', '${url}', '${poster_url}', '${country}', ${time}, '${actor}', ${episode_total}, '${content}', '${publish}', '${admin_id}', '${created_by}', '${created_at}', '${updated_at}')`
      const updateMovie = await sequelize.query(movieSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, updateMovie)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async deleteMovie(req) {
    const listId = req?.body?.listId

    try {
      const deleteMovieSql = `delete from movie where id in (${listId})`
      const deleteMovie = await sequelize.query(deleteMovieSql, {
        type: QueryTypes.SELECT,
      })

      return this.result(200, true, Message.SUCCESS, deleteMovie)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }
}

export default new MovieService()
