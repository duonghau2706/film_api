import ResponseUtils from '@/utils/ResponseUtils'
import log4js from 'log4js'
import { Message } from '@/utils/Message'

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
class DashBroadService {
  constructor() {
    this.result = ResponseUtils
  }

  async getAllDb(req) {
    const startDb = req?.body?.startDb
    const endDb = req?.body?.endDb

    try {
      //---------CARD--------------
      let sqlCardAvg = 'select list_rated from movie where 1=1'
      let sqlCardAllShows = 'select count(*) as all_shows from movie where 1=1'
      let sqlCardSingle =
        "SELECT count (*) as single from movie where 1=1 and type = 'single'"
      let sqlCardMovies =
        "SELECT count (*) as series from movie where 1=1 and type = 'series'"

      //---------TIME--------------
      let sortSql =
        "SELECT COUNT(*) as sort FROM movie WHERE type='single' and time < 30"
      let normalSql =
        "SELECT COUNT(*) as normal FROM movie WHERE type='single' and time >= 30 AND time < 60"
      let longSql =
        "SELECT COUNT(*) as long FROM movie WHERE type='single' and time >= 60 AND time <= 120"
      let veryLongSql =
        "SELECT COUNT(*) as very_long FROM movie WHERE type='single' and time > 120"

      //---------VIEW--------------
      let veryFewSql =
        'SELECT COUNT(*) as very_few FROM movie WHERE view < 1000'
      let fewSql =
        'SELECT COUNT(*) as few FROM movie WHERE view >= 1000 AND view < 10000'
      let muchSql =
        'SELECT COUNT(*) as much FROM movie WHERE view >= 10000 AND view <= 100000'
      let veryMuchSql =
        'SELECT COUNT(*) as very_much FROM movie WHERE view > 100000'

      //---------TRENDING--------------
      const mondaySql =
        'select type, sum(view_of_monday) from movie group by type'
      const tuesdaySql =
        'select type, sum(view_of_tuesday) from movie group by type'
      const wednesdaySql =
        'select type, sum(view_of_wednesday) from movie group by type'
      const thursdaySql =
        'select type, sum(view_of_thursday) from movie group by type'
      const fridaySql =
        'select type, sum(view_of_friday) from movie group by type'
      const saturdaySql =
        'select type, sum(view_of_saturday) from movie group by type'
      const sundaySql =
        'select type, sum(view_of_sunday) from movie group by type'

      const monthOneSql =
        'select type, sum(view_of_month_one) from movie group by type'
      const monthTwoSql =
        'select type, sum(view_of_month_two) from movie group by type'
      const monthThreeSql =
        'select type, sum(view_of_month_three) from movie group by type'
      const monthFourSql =
        'select type, sum(view_of_month_four) from movie group by type'
      const monthFiveSql =
        'select type, sum(view_of_month_five) from movie group by type'
      const monthSixSql =
        'select type, sum(view_of_month_six) from movie group by type'
      const monthSevenSql =
        'select type, sum(view_of_month_seven) from movie group by type'
      const monthEightSql =
        'select type, sum(view_of_month_eight) from movie group by type'
      const monthNineSql =
        'select type, sum(view_of_month_nine) from movie group by type'
      const monthTenSql =
        'select type, sum(view_of_month_ten) from movie group by type'
      const monthElevenSql =
        'select type, sum(view_of_month_eleven) from movie group by type'
      const monthTwelveSql =
        'select type, sum(view_of_month_twelve) from movie group by type'

      //---------YEAR--------------
      let yearSingleSql =
        "select year_publish, count (*) as year_publish_single from movie where 1=1 and type='single' and year_publish BETWEEN '2016' and '2023' group by year_publish"
      let yearSeriesSql =
        "select year_publish, count (*) as year_publish_series from movie where 1=1 and type='series' and year_publish BETWEEN '2016' and '2023' group by year_publish"

      if (startDb && endDb) {
        sqlCardAllShows += ` and created_at between '${startDb}' and '${endDb}'`
        sqlCardAvg += ` and created_at between '${startDb}' and '${endDb}'`
        sqlCardMovies += ` and created_at between '${startDb}' and '${endDb}'`
        sqlCardSingle += ` and created_at between '${startDb}' and '${endDb}'`
        sortSql += ` and created_at between '${startDb}' and '${endDb}'`
        normalSql += ` and created_at between '${startDb}' and '${endDb}'`
        longSql += ` and created_at between '${startDb}' and '${endDb}'`
        veryLongSql += ` and created_at between '${startDb}' and '${endDb}'`
        veryFewSql += ` and created_at between '${startDb}' and '${endDb}'`
        fewSql += ` and created_at between '${startDb}' and '${endDb}'`
        muchSql += ` and created_at between '${startDb}' and '${endDb}'`
        veryMuchSql += ` and created_at between '${startDb}' and '${endDb}'`
      }

      const cardAvg = await sequelize.query(sqlCardAvg, {
        type: QueryTypes.SELECT,
      })
      const cardAllShows = await sequelize.query(sqlCardAllShows, {
        type: QueryTypes.SELECT,
      })
      const cardSingle = await sequelize.query(sqlCardSingle, {
        type: QueryTypes.SELECT,
      })
      const cardSeries = await sequelize.query(sqlCardMovies, {
        type: QueryTypes.SELECT,
      })

      const sort = await sequelize.query(sortSql, {
        type: QueryTypes.SELECT,
      })
      const normal = await sequelize.query(normalSql, {
        type: QueryTypes.SELECT,
      })
      const long = await sequelize.query(longSql, {
        type: QueryTypes.SELECT,
      })
      const veryLong = await sequelize.query(veryLongSql, {
        type: QueryTypes.SELECT,
      })

      const veryFew = await sequelize.query(veryFewSql, {
        type: QueryTypes.SELECT,
      })
      const few = await sequelize.query(fewSql, {
        type: QueryTypes.SELECT,
      })
      const much = await sequelize.query(muchSql, {
        type: QueryTypes.SELECT,
      })
      const veryMuch = await sequelize.query(veryMuchSql, {
        type: QueryTypes.SELECT,
      })

      const yearSingle = await sequelize.query(yearSingleSql, {
        type: QueryTypes.SELECT,
      })
      const yearSeries = await sequelize.query(yearSeriesSql, {
        type: QueryTypes.SELECT,
      })

      const monday = await sequelize.query(mondaySql, {
        type: QueryTypes.SELECT,
      })
      const tuesday = await sequelize.query(tuesdaySql, {
        type: QueryTypes.SELECT,
      })
      const wednesday = await sequelize.query(wednesdaySql, {
        type: QueryTypes.SELECT,
      })
      const thursday = await sequelize.query(thursdaySql, {
        type: QueryTypes.SELECT,
      })
      const friday = await sequelize.query(fridaySql, {
        type: QueryTypes.SELECT,
      })
      const saturday = await sequelize.query(saturdaySql, {
        type: QueryTypes.SELECT,
      })
      const sunday = await sequelize.query(sundaySql, {
        type: QueryTypes.SELECT,
      })

      const monthOne = await sequelize.query(monthOneSql, {
        type: QueryTypes.SELECT,
      })
      const monthTwo = await sequelize.query(monthTwoSql, {
        type: QueryTypes.SELECT,
      })
      const monthThree = await sequelize.query(monthThreeSql, {
        type: QueryTypes.SELECT,
      })
      const monthFour = await sequelize.query(monthFourSql, {
        type: QueryTypes.SELECT,
      })
      const monthFive = await sequelize.query(monthFiveSql, {
        type: QueryTypes.SELECT,
      })
      const monthSix = await sequelize.query(monthSixSql, {
        type: QueryTypes.SELECT,
      })
      const monthSeven = await sequelize.query(monthSevenSql, {
        type: QueryTypes.SELECT,
      })
      const monthEight = await sequelize.query(monthEightSql, {
        type: QueryTypes.SELECT,
      })
      const monthNine = await sequelize.query(monthNineSql, {
        type: QueryTypes.SELECT,
      })
      const monthTen = await sequelize.query(monthTenSql, {
        type: QueryTypes.SELECT,
      })
      const monthEleven = await sequelize.query(monthElevenSql, {
        type: QueryTypes.SELECT,
      })
      const monthTwelve = await sequelize.query(monthTwelveSql, {
        type: QueryTypes.SELECT,
      })

      const dataRes = {
        card: {
          cardAvg,
          cardAllShows,
          cardSingle,
          cardSeries,
        },
        chart: {
          time: {
            sort,
            normal,
            long,
            veryLong,
          },
          view: {
            veryFew,
            few,
            much,
            veryMuch,
          },
          trending: {
            week: {
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday,
            },
            month: {
              monthOne,
              monthTwo,
              monthThree,
              monthFour,
              monthFive,
              monthSix,
              monthSeven,
              monthEight,
              monthNine,
              monthTen,
              monthEleven,
              monthTwelve,
            },
          },
          yearPublish: {
            yearSingle,
            yearSeries,
          },
        },
      }

      return this.result(200, true, Message.SUCCESS, dataRes)
    } catch (error) {
      throw error
    }
  }
}

export default new DashBroadService()
