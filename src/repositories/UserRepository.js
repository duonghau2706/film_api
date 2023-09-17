import { Op, QueryTypes } from 'sequelize'
import {
  CourseModel,
  LectureModel,
  UserCourseModel,
  UserLectureModel,
  UserModel,
} from '../models'
import { Constants } from '../utils/Constants'
import BaseRepository from './BaseRepository'
import { sequelize } from '@/helpers/connection'

class UserRepository extends BaseRepository {
  constructor(props) {
    super(props)
    this.model = UserModel
  }

  // data arr
  async bulkSaveUser(data, transaction = null) {
    const trans = { transaction: transaction ?? null }
    return await this.model.bulkCreate(data, trans)
  }

  async bulkDeleteUser(data, transaction = null) {
    const trans = { transaction: transaction ?? null }
    return await this.model.destroy({ where: { id: data }, ...trans })
  }

  async getUserCourseLecture(userIds) {
    return this.model.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
      include: [
        {
          model: CourseModel,
          as: 'courses',
        },
        {
          model: LectureModel,
          as: 'lectures',
        },
      ],
    })
  }

  async findAllCourseCompletedOnMonth(
    status,
    paramFromEnddate,
    paramToEnddate,
    recordExits
  ) {
    let rawQuery = `select uc.status, c.id, c.name, c.type, uc.end_date, uc.user_id, u.last_name, u.first_name, u.first_name_furi, u.last_name_furi, u.pharmacist_number, u.email from courses as c inner join users_courses as uc on uc.course_id = c.id inner join users as u on u.id = uc.user_id where uc.status = $1 and uc.end_date >= $2 and uc.end_date <= $3 and c.delete_flag = $4 and uc.delete_flag = $4 and u.delete_flag = $4`
    const respData = await sequelize.query(rawQuery, {
      bind: [status, paramFromEnddate, paramToEnddate, recordExits],
      type: QueryTypes.SELECT,
    })
    return respData
  }
}

export default new UserRepository()
