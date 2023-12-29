import { sequelize } from '@/helpers/connection'
import { verifyToken } from '@/helpers/token'
import { UserService } from '@/services'
import MovieService from '@/services/MovieService'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import { findByIdUserValidate, updateUserValidate } from '@/validations'
import camelcaseKeys from 'camelcase-keys'
import * as dotenv from 'dotenv'
import log4js from 'log4js'
import { QueryTypes } from 'sequelize'

dotenv.config()
const logger = log4js.getLogger()

export default class UserController {
  constructor() {
    this.response = ResponseUtils
  }

  async getListMovieByListMovieId(req, res, next) {
    try {
      const lstMovie = await MovieService.getListMovieByListMovieId(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, lstMovie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getInforMovie(req, res, next) {
    try {
      const inforMovie = await MovieService.getInforMovieByMovieId(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, inforMovie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getAllMovie(req, res, next) {
    try {
      const movie = await MovieService.getAllMovie(req)
      res.status(200).json(this.response(200, Message.SUCCESS, null, movie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getAllSingleMovie(req, res, next) {
    try {
      const singleMovie = await MovieService.getAllSingleMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, singleMovie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getAllSeriesMovie(req, res, next) {
    try {
      const seriesMovie = await MovieService.getAllSeriesMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, seriesMovie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async getListEpisode(req, res, next) {
    try {
      const listEpisode = await MovieService.getListEpisode(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, listEpisode))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async updateRateMovie(req, res, next) {
    try {
      const updateRate = await MovieService.updateRateMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, updateRate))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async updateViewMovie(req, res, next) {
    try {
      const updateView = await MovieService.updateViewMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, updateView))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async updateMovie(req, res, next) {
    try {
      const updateView = await MovieService.updateMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, updateView))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async createMovie(req, res, next) {
    try {
      const createMovie = await MovieService.createMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, createMovie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }

  async deleteMovie(req, res, next) {
    try {
      const deleteMovie = await MovieService.deleteMovie(req)
      res
        .status(200)
        .json(this.response(200, Message.SUCCESS, null, deleteMovie))
    } catch (error) {
      console.log(error)
      res.status(400).json(this.response(400, error.message, null))
    }
  }
}
