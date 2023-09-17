import log4js from 'log4js'
import Customer from '@/models/customer'
import Users from '@/models/user'
import { sequelize } from '@/helpers/connection'
import { Message } from '@/utils/Message'
import ResponseUtils from '@/utils/ResponseUtils'
import SentMailHistory from '@/models/sentMailHistory'
import DateUtils from '@/utils/DateUtils'
import { element as elementPaginate } from '@/helpers/paginate'
import * as dotenv from 'dotenv'
import moment from 'moment'
import { subtract } from 'lodash'
import dayjs from 'dayjs'
const { QueryTypes, col } = require('sequelize')

dotenv.config()
const logger = log4js.getLogger()

class getTotalAssign {
  constructor() {
    this.customerModel = Customer
    this.userModel = Users
    this.SentMailHistory = SentMailHistory
    this.result = ResponseUtils
  }
  // Tổng số khách hàng được Assign by user

  async getCustomerAssignMent(req, res) {
    try {
      const userId = req.query.userId
      const rawSql = `

                SELECT users.id, users.username, COUNT(customers.person_in_charge_id) as KHASSIGN_FORM

                FROM users

                LEFT JOIN customers ON users.id = customers.person_in_charge_id

                WHERE users.id = '${userId}'

                GROUP BY users.id, users.username

              `

      let bindParam = []

      const result = await sequelize.query(rawSql, {
        bindParam: bindParam,

        type: QueryTypes.SELECT,
      })

      const totalRecord = result.length
      if (!totalRecord) {
        return res.status(400).json({
          success: true,
          totalRecord: 0,
          message: Message.SUCCESS,
        })
      }

      return this.result(200, true, Message.SUCCESS, result)
    } catch (err) {}
  }

  // Lấy ra trạng thái các case

  async getTotalCaseSend(req, res) {
    // try {
    const userId = req.query.userId

    const startDate = req.query.startDate
      ? DateUtils.convertStartDateToStringFullTime(req.query.startDate)
      : null
    const endDate = req.query.endDate
      ? DateUtils.convertEndDateToStringFullTime(req.query.endDate)
      : null
    let case_assign = `
              select Count(customers.person_in_charge_id) as KHASSIGN from users 
              RIGHT JOIN customers ON users.id = customers.person_in_charge_id
              WHERE users.id = '${userId}'`

    const result11 = await sequelize.query(case_assign, {
      type: QueryTypes.SELECT,
    })

    let sql = `
              SELECT COUNT(CASE WHEN status IN(0,2) AND pregnancy_status_sending IN(1,2)  THEN 1 ELSE NULL END) AS case_send
              FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
              WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
              AND b.id = '${userId}' ;
              `

    const result = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    })

    let sql_case_send_mail = `
              SELECT COUNT(CASE WHEN status = 0 AND pregnancy_status_sending = 1 THEN 1 ELSE NULL END) AS case_send_mail_success
              FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
              WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
              AND b.id = '${userId}' ;
              `
    const result1 = await sequelize.query(sql_case_send_mail, {
      type: QueryTypes.SELECT,
    })
    let sql_case_send_inquiry = `
              SELECT COUNT(CASE WHEN status = 0 AND pregnancy_status_sending = 2 THEN 1 ELSE NULL END) AS case_send_inquiry_success
              FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
              WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
              AND b.id = '${userId}' ;   
              `
    const result2 = await sequelize.query(sql_case_send_inquiry, {
      type: QueryTypes.SELECT,
    })
    let sql_case_send_fs_mail = `
              SELECT COUNT(CASE WHEN status = 2 AND pregnancy_status_sending = 1 THEN 1 ELSE NULL END) AS case_send_fs_mail
              FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
              WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
              AND b.id = '${userId}' 
              `
    const result3 = await sequelize.query(sql_case_send_fs_mail, {
      type: QueryTypes.SELECT,
    })
    let sql_case_send_fs_inquiry = `
            SELECT COUNT(CASE WHEN status = 2 AND pregnancy_status_sending = 2 THEN 1 ELSE NULL END) AS case_send_fs_inquiry
            FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
            WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
            AND b.id = '${userId}' 
            `
    const result4 = await sequelize.query(sql_case_send_fs_inquiry, {
      type: QueryTypes.SELECT,
    })
    let sql7 = `
      SELECT CAST(

        (COUNT(CASE WHEN status = 0 AND pregnancy_status_sending = 1 THEN 1 ELSE NULL END) * 100.0) /

        NULLIF(COUNT(NULLIF(pregnancy_status_sending, 0)), 0)

        AS DECIMAL(10, 2)) AS phantramMail
    FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
    WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
    AND b.id = '${userId}' ;
              `
    const result7 = await sequelize.query(sql7, {
      type: QueryTypes.SELECT,
    })

    let sql8 = `SELECT CAST(
        (COUNT(CASE WHEN status = 0 AND pregnancy_status_sending = 2 THEN 1 ELSE NULL END) * 100.0) / 
        NULLIF(COUNT(NULLIF(pregnancy_status_sending, 0)), 0)

        AS DECIMAL(10, 2)) AS phantraminquiry
    FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
    WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
    AND b.id = '${userId}' ;`
    const result8 = await sequelize.query(sql8, {
      type: QueryTypes.SELECT,
    })

    let sql9 = `
      SELECT CAST(

        (COUNT(CASE WHEN status = 2 AND pregnancy_status_sending = 1 THEN 1 ELSE NULL END) * 100.0) /

        NULLIF(COUNT(NULLIF(pregnancy_status_sending, 0)), 0)

        AS DECIMAL(10, 2)) AS phantramfs_mail
    FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
    WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
    AND b.id = '${userId}' ;`

    const result9 = await sequelize.query(sql9, {
      type: QueryTypes.SELECT,
    })

    let sql10 = `
      SELECT CAST(

        (COUNT(CASE WHEN status = 2 AND pregnancy_status_sending = 2 THEN 1 ELSE NULL END) * 100.0) /

        NULLIF(COUNT(NULLIF(pregnancy_status_sending, 0)), 0)

        AS DECIMAL(10, 2)) AS phantramfs_inquiry
    FROM sent_mail_histories as a LEFT JOIN users as b on a.user_id = b.id 
    WHERE status IN (0, 2) AND a.send_date between '${startDate}' and  '${endDate}'
    AND b.id = '${userId}';
         
    `
    console.log('sql', sql10)
    const result10 = await sequelize.query(sql10, {
      type: QueryTypes.SELECT,
    })

    const newData = []
    newData.push(result[0])
    newData.push(result1[0])
    newData.push(result2[0])
    newData.push(result3[0])
    newData.push(result4[0])
    newData.push(result7[0])
    newData.push(result8[0])
    newData.push(result9[0])
    newData.push(result10[0])
    newData.push(result11[0])

    return newData
    // } catch (err) {}
  }
  //Số khách hàng chưa gửi và số khách  hàng đã gửi
  async getTotalsendAndUnsend(req, res) {
    try {
      let sql = `
              SELECT
              CASE
                  WHEN DATE_PART('day', CURRENT_DATE - sent_mail_histories.send_date) < 6 THEN 'Đã gửi'
                  ELSE 'Chưa gửi'
              END AS TrangThai,
              COUNT(customer_resources.name) as Total,
                  customer_resources.name,
                  customer_resources.created_by
              FROM
                  customer_resources
              LEFT JOIN
                  sent_mail_histories ON customer_resources.created_by = sent_mail_histories.created_by
              WHERE
                  customer_resources.created_by = 'longqh'
              GROUP BY
                  customer_resources.name,
                  customer_resources.created_by,
                  TrangThai;
              `
      let bindParam = []
      let result = await sequelize.query(sql, {
        bindParam: bindParam,
        type: QueryTypes.SELECT,
      })
      let data = []
      data.push(result)
    } catch {
      return this.result(500, Message.ERROR, null)
    }
  }

  // lấy ra id customer
  async getCustomerId() {
    const sql = `SELECT customer_id FROM sent_mail_histories`
    const result_data = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    })
    let data_id = []
    for (const row of result_data) {
      data_id.push(row.customer_id)
    }

    return data_id
  }

  // lấy ra ngày gửi gần nhất
  async getNewSendDate(customers, sentMailHistory) {
    const sentMail = sentMailHistory.find((item) => {
      return item.customer_id === customers.id
    })
    return sentMail?.dataValues?.send_date
  }
  // code lai
  //B1: Lấy ra thông tin cần sử dụng : tần suất, send_date, cusomer_id
  async getTotalIntroduceCase() {
    let sqlIntroduce = `select distinct
      a.frequency_of_email,
      a.id,
      b.send_date,
      b.customer_id
      from
      customers as a
      left join sent_mail_histories as b on b.customer_id = a.id`
    const bindParam = []
    const result = await sequelize.query(sqlIntroduce, {
      bind: bindParam,
      type: QueryTypes.SELECT,
    })
    return result.map((item) => ({
      frequency_of_email: item.frequency_of_email,
      customer_id: item.customer_id,
      send_date: item.send_date,
      id: item.id,
    }))
  }
  //B2: Lấy ra ngày nếu như có tần suất còn không set trạng thái là chưa gửi
  async getDateToCheck(items) {
    let statusSending

    if (
      (items.frequency_of_email === null && !items.send_date) ||
      (items.frequency_of_email && !items.send_date)
    ) {
      statusSending = 'Chưa gửi'
    }
    if (
      (items.frequency_of_email === null && items.send_date) ||
      (!items.frequency_of_email && items.send_date)
    ) {
      statusSending = 'Đã gửi'
    }
    if (items.frequency_of_email) {
      let daytocheck
      switch (items.frequency_of_email) {
        case '1':
          daytocheck = 7
          break
        case '2':
          daytocheck = 30
          break
        case '3':
          daytocheck = 60
          break
        case '4':
          daytocheck = 90
          break
        case '5':
          daytocheck = 180
          break
        default:
          daytocheck = 0
          break
      }
      const dataCheck = await this.CheckStatusSendMail(
        daytocheck,
        items.frequency_of_email,
        items.send_date,
        items.customer_id
      )
      if (dataCheck.length === 0) {
        statusSending = 'Chưa gửi'
      } else if (dataCheck.length > 0) {
        statusSending = 'Đã gửi'
      }
    } else {
      statusSending = 'Chưa gửi'
    }

    return {
      ...items,
      statusSending,
    }
  }

  //B4 đêms ra số trạng thái của từng khach hàng : chưa gửi đẫ gửi
  async CountStatusSending(req, res) {
    const dataList = await this.getTotalIntroduceCase()

    const dataCheckList = await Promise.all(
      dataList?.map((item) => this.getDateToCheck(item))
    )
    const listUnSend = dataCheckList.filter(
      (item) => item.statusSending === 'Chưa gửi'
    )

    const listSend = dataCheckList.filter(
      (item) => item.statusSending === 'Đã gửi'
    )

    const dataSend = []
    dataSend.push(listSend)
    dataSend.push(listUnSend)
    return dataSend
  }

  // case 14
  // Case Tổng số khách hàng ở từng nguồn
  async getTotalCaseResourceIntroduce() {
    let sqlIntroduce = `SELECT
            a.frequency_of_email,
            a.id AS customer_id
            FROM
                customers AS a
            LEFT JOIN
                sent_mail_histories AS b ON b.customer_id = a.id;
 `
    const result = await sequelize.query(sqlIntroduce, {
      type: QueryTypes.SELECT,
    })

    return result.map((items) => {
      return {
        frequency_of_email: items.frequency_of_email,
        customer_id: items.customer_id,
      }
    })
  }
  // dung du lieu de check theo trang thai : da gui , chua gui
  async getStatusResource(items) {
    if (
      (!items.frequency_of_email || items.frequency_of_email === null) &&
      (await this.CheckStatusSendMail(
        360,
        items.frequency_of_email,
        items.customer_id
      ).length) > 0
    ) {
      return 'Đã gửi'
    }
    if (items.frequency_of_email) {
      //Tần suất bằng 1
      if (
        items.frequency_of_email === '1' &&
        (
          await this.CheckStatusSendMail(
            7,
            items.frequency_of_email,
            items.customer_id
          )
        ).length > 0
      ) {
        return 'Đã gửi'
      }

      //Tần suất bằng 2
      if (
        items.frequency_of_email === '2' &&
        (
          await this.CheckStatusSendMail(
            30,
            items.frequency_of_email,
            items.customer_id
          )
        ).length > 0
      ) {
        return 'Đã gửi'
      }

      //Tần suất bằng 3
      if (
        items.frequency_of_email === '3' &&
        (
          await this.CheckStatusSendMail(
            60,
            items.frequency_of_email,
            items.customer_id
          )
        ).length > 0
      ) {
        return 'Đã gửi'
      }
      //Tần suất bằng 4
      if (
        items.frequency_of_email === '4' &&
        (
          await this.CheckStatusSendMail(
            90,
            items.frequency_of_email,
            items.customer_id
          )
        ).length > 0
      ) {
        return 'Đã gửi'
      }

      //Tần suất bằng 5
      if (
        items.frequency_of_email === '5' &&
        (
          await this.CheckStatusSendMail(
            180,
            items.frequency_of_email,
            items.customer_id
          )
        ).length > 0
      ) {
        return 'Đã gửi'
      }
      return 'Chưa gửi'
    }
    return 'Chưa gửi'
  }
  //B3:Check nếu có tần suất: 1, 2,3,4,5
  async CheckStatusSendMail(date, frequency_of_email, customer_id) {
    const endDate = moment()
    const startDate = moment().subtract(date, 'days')

    const startDateSQL = startDate.format('YYYY-MM-DD')
    const endDateSQL = endDate.format('YYYY-MM-DD')

    const bindParam = [
      customer_id,
      frequency_of_email,
      startDateSQL,
      endDateSQL,
    ]
    const sqlCheck = `
    SELECT * FROM sent_mail_histories 
    INNER JOIN customers ON customers.id = sent_mail_histories.customer_id
    WHERE sent_mail_histories.customer_id = $1
    AND customers.frequency_of_email = $2
    AND sent_mail_histories.send_date BETWEEN $3 AND $4;
;`

    const result = await sequelize.query(sqlCheck, {
      bind: bindParam,
      type: QueryTypes.SELECT,
    })
    return result
  }

  // b3: Dem ra so khach hang theo tung nguon
  async CountStatusSendingSource(req, res) {
    //Lấy ra thông tin cần lấy
    const dataList = await this.getTotalCaseResourceIntroduce()
    // Map ra trạng thái của từng case: chưa gửi or đã gửi
    const dataResult = await Promise.all(
      dataList.map(async (item) => ({
        ...item,
        statusSending: await this.getStatusResource(item),
      }))
    )
    //Đếm số case của theo từng trạng thái
    const listUnSend = dataResult.filter(
      (item) => item.statusSending === 'Chưa gửi'
    )

    const listSend = dataResult.filter(
      (item) => item.statusSending === 'Đã gửi'
    )

    const dataSend = []
    dataSend.push(listSend)
    dataSend.push(listUnSend)
    return dataSend
  }
  //Lấy case theo trạng thái : chưa gửi , đẫ gửi and theo từng nguồn
  //B2: Sử dụng id để làm điều kiện để lấy ra giá trị;
  async dashBroadCustomerResource() {
    //truy vấn dữ liệu có trong database
    // đã sửa lại đoạn này ngày 17/08/2023
    const sqlCustomer = `
    SELECT
    rs_id,
    rs_name,
    COUNT(*) AS total,
    SUM(
        CASE
            WHEN status_sent = 'Đã gửi' THEN 1
            ELSE 0
        END
    ) AS TotalSent,
    SUM(
        CASE
            WHEN status_sent = 'Chưa gửi' THEN 1
            ELSE 0
        END
    ) AS TotalUnSent,
    SUM(
       CASE 
          WHEN status_sent = 'Gửi lỗi' THEN 1 
          ELSE 0
         END
    ) AS TotalSentFalse
FROM
    (
         select
            r.id as rs_id,
            r.name as rs_name,
            c.id as cus_id,
            c.name as cus_name,
            c.frequency_of_email as tansuat,
            c.start_date,
            max(h.send_date) as send_date,
            CASE
                WHEN c.frequency_of_email IS NULL AND MAX(h.send_date) IS NULL THEN 'Chưa gửi'
                WHEN c.frequency_of_email IS NULL AND MAX(h.send_date) IS NOT NULL AND h.status = 0 THEN 'Đã gửi'
                WHEN c.frequency_of_email IS NULL AND MAX(h.send_date) IS NOT NULL AND h.status = 2 THEN 'Gửi lỗi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) IS NULL THEN 'Chưa gửi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) < c.start_date THEN 'Chưa gửi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) > c.start_date AND h.status = 0 THEN 'Đã gửi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) > c.start_date AND h.status = 2 THEN 'Gửi lỗi'
            END AS status_sent
 from (
     select id, name, frequency_of_email, customer_resource_id,
     (Current_date - (
     Case 
         WHEN frequency_of_email = '1' THEN 7 
         WHEN frequency_of_email = '2' THEN 30
         WHEN frequency_of_email = '3' THEN 60
         WHEN frequency_of_email = '4' THEN 90
         WHEN frequency_of_email = '5' THEN 180
         END)):: timestamp with time zone as start_date 
     from public.customers
     ) as c
     join customer_resources r on c.customer_resource_id = r.id
     left join sent_mail_histories h on c.id = h.customer_id
 Group BY r.id,
     r.name ,
     c.id ,
     c.name ,
     c.frequency_of_email ,
      h.status,
     c.start_date)
     as tbl_search
 GROUP BY rs_id, rs_name
    `
    const result = await sequelize.query(sqlCustomer, {
      type: QueryTypes.SELECT,
    })

    return result
  }
  //B3:Gọi hàm lấy ra tổng số case
  async dashbroadCaseSum() {
    const dataResult = await this.dashBroadCustomerResource()
    return dataResult
  }

  // todo: Lấy ra dữ liệu table của từng user
  async dashBroadCustomerResourceFlowUser(req, res) {
    const userId = req.query.userId
    const sqlCustomer = `  
SELECT
    rs_id,
    rs_name,
    nguoitao,
    user_assinment,
    COUNT(*) AS total,
    SUM(
        CASE
            WHEN status_sent = 'Đã gửi' THEN 1
            ELSE 0
        END
    ) AS TotalSent,
    SUM(
        CASE
            WHEN status_sent = 'Chưa gửi' THEN 1
            ELSE 0
        END
    ) AS TotalUnSent,
    SUM(
       CASE 
          WHEN status_sent = 'Gửi lỗi' THEN 1 
          ELSE 0
         END
    ) AS TotalSentFalse
FROM
    (
        SELECT
            r.id AS rs_id,
            r.name AS rs_name,
            c.id AS cus_id,
            c.name AS cus_name,
            c.frequency_of_email AS tansuat,
            c.start_date,
            c.created_by AS nguoitao,
            c.user_assign as user_assinment,
            MAX(h.send_date) AS send_date,
            CASE
                WHEN c.frequency_of_email IS NULL AND MAX(h.send_date) IS NULL THEN 'Chưa gửi'
                WHEN c.frequency_of_email IS NULL AND MAX(h.send_date) IS NOT NULL AND h.status = 0 THEN 'Đã gửi'
                WHEN c.frequency_of_email IS NULL AND MAX(h.send_date) IS NOT NULL AND h.status = 2 THEN 'Gửi lỗi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) IS NULL THEN 'Chưa gửi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) < c.start_date THEN 'Chưa gửi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) > c.start_date AND h.status = 0 THEN 'Đã gửi'
                WHEN c.frequency_of_email IS NOT NULL AND MAX(h.send_date) > c.start_date AND h.status = 2 THEN 'Gửi lỗi'
            END AS status_sent
        FROM
            (
                SELECT
                    customers.id,
                    customers.name,
                    customers.frequency_of_email,
                    customers.customer_resource_id,
                    customers.created_by,
                    customers.user_id,
                    e.name AS user_assign,
                    (
                        CURRENT_DATE - (
                            CASE
                                WHEN customers.frequency_of_email = '1' THEN INTERVAL '7 days'
                                WHEN customers.frequency_of_email = '2' THEN INTERVAL '30 days'
                                WHEN customers.frequency_of_email = '3' THEN INTERVAL '60 days'
                                WHEN customers.frequency_of_email = '4' THEN INTERVAL '90 days'
                                WHEN customers.frequency_of_email = '5' THEN INTERVAL '180 days'
                            END
                        )
                    ) AS start_date
                FROM
                    public.customers
                    LEFT JOIN users e ON e.id = customers.user_id
            ) AS c
            JOIN customer_resources r ON c.customer_resource_id = r.id
            LEFT JOIN sent_mail_histories h ON c.id = h.customer_id
        WHERE
            c.id IN (
                SELECT
                    f.id
                FROM
                    customers AS f
                WHERE
                person_in_charge_id = '${userId}'
            )
        GROUP BY
            r.id,
            r.name,
            c.id,
            c.name,
            c.frequency_of_email,
            c.start_date,
            c.created_by,
            c.user_assign,h.status
    ) AS tbl_search
    LEFT JOIN customers AS b ON b.customer_resource_id = tbl_search.cus_id
GROUP BY
    rs_id,
    rs_name,
    nguoitao,
    user_assinment;

  `
    const result = await sequelize.query(sqlCustomer, {
      type: QueryTypes.SELECT,
    })

    return result
  }
  // gọi hàm dashBroadCustomerResourceFlowUser();
  async dashbroadCaseSumFlowUser(req, res) {
    const dataResult = await this.dashBroadCustomerResourceFlowUser(req, res)
    return dataResult
  }
  //B3.1: Gọi hàm
  async dashbroadCase() {
    const dataResult = await this.dashBroadCustomerResource()
    const flattenedArray = [].concat(...dataResult)
    return flattenedArray
  }

  //Case : lấy ra trạng phần trăm hiệu suất của từng member
  async totalCaseSendNumberWork(req) {
    const endDate = req.query.endDate
    const startDate = req.query.startDate
    //Thống kê hiệu suất của từng member
    // let bindParam = [startDate, endDate]
    let sql1 = `
      
    SELECT
    DISTINCT ON (em.user_id) em.user_id,
    em.name_user,
    CASE
        WHEN em.work_date BETWEEN '${startDate}' AND '${endDate}' THEN
            CASE
                WHEN SUM(em.number_work_hours) <> 0 THEN
                    ROUND(
                        COUNT(
                            CASE
                                WHEN smh.status IN (0, 2)
                                AND smh.pregnancy_status_sending IN (1, 2) THEN 1
                                ELSE 0
                            END
                        ) / SUM(em.number_work_hours),
                        2
                    )
                ELSE 0
            END
        ELSE 0
    END AS performance
FROM
    effort_members AS em
LEFT JOIN
    sent_mail_histories AS smh ON smh.user_id = em.user_id
GROUP BY
    em.user_id,
    em.name_user,
    em.work_date
ORDER BY
    em.user_id,
    performance DESC;
    `
    const result1 = await sequelize.query(sql1, {
      // bind: bindParam,
      type: QueryTypes.SELECT,
    })
    return result1
  }
  // lấy theo case theo từng tuần
  async listPerformanceUser(req, res) {
    // sửa lại
    const endDate = req.query.endDate
    const startDate = req.query.startDate
    const userId = req.query.userID
    let bindParam1 = [startDate, endDate]
    let sql3 = `
    WITH all_weeks AS (
      SELECT generate_series(
          $1::date,
          $2::date - INTERVAL '6 days',
          '7 days'::interval
      ) AS week_start
  ),
  first_week_start AS (
      SELECT MIN(week_start) AS start_date
      FROM all_weeks
  )
  SELECT
      a.user_id,
      aw.week_start,
      FLOOR(EXTRACT(DAY FROM aw.week_start - (SELECT start_date FROM first_week_start)) / 7) + 1 AS week_of_month,
      COALESCE(
          SUM(CASE WHEN a.work_date >= aw.week_start AND a.work_date < aw.week_start + INTERVAL '7 days' AND c.status = 0 AND c.pregnancy_status_sending IN (1, 2) THEN 1 ELSE 0 END) /
          (CASE WHEN SUM(a.number_work_hours) = 0 THEN 1 ELSE SUM(a.number_work_hours) END), 0
      ) AS performance
  FROM
      all_weeks AS aw
  CROSS JOIN
      effort_members AS a
  LEFT JOIN
      sent_mail_histories AS c ON c.user_id = a.user_id
  LEFT JOIN
      customers AS b ON b.id = c.customer_id
  WHERE
      a.work_date BETWEEN $1 AND $2
            `
    const groupBy2 = `
    GROUP BY 
    a.user_id, aw.week_start, week_of_month
ORDER BY
    aw.week_start ASC, week_of_month ASC;`
    if (userId) {
      bindParam1.push(userId)
      sql3 += `
         AND a.user_id =  $${bindParam1.length}        
    `
    }
    const rawSql2 = sql3 + groupBy2
    const result3 = await sequelize.query(rawSql2, {
      bind: bindParam1,
      type: QueryTypes.SELECT,
    })
    return result3
  }
  // lấy ra các user id trong bảng user để lấy dữ liệu theo từng user
  async listUserAndId(req, res) {
    const sql = `         
                  SELECT
                  id,
                  name
                  from
                  users
    `
    const result = await sequelize.query(sql, {
      type: QueryTypes.SELECT,
    })
    return result
  }
  // bottom

  async getCases(req) {
    try {
      const startDate = req.query.startDate
        ? dayjs(req.query.startDate).format('YYYY-MM-DD 00:00')
        : ''
      const endDate = req.query.endDate
        ? dayjs(req.query.endDate).format('YYYY-MM-DD 23:59')
        : ''

      let cases = `SELECT 
          count(*) AS Total, 
          sum(case when status = 0 then 1 else 0 end) AS Sent, 
          sum(case when status = 1 or status = 2 then 1 else 0 end) AS UnSent 
      FROM 
          sent_mail_histories `

      if (startDate && endDate) {
        cases += `WHERE sent_mail_histories.send_date BETWEEN '${startDate}' and '${endDate}'`
      }

      //Case: theo ngày tháng
      const getCases = await sequelize.query(cases, {
        type: QueryTypes.SELECT,
      })

      const DashBoardDataCases = {
        cases: getCases,
      }

      return this.result(200, true, Message.SUCCESS, DashBoardDataCases)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getResponses(req) {
    try {
      const startDate = req.query.startDate
        ? dayjs(req.query.startDate).format('YYYY-MM-DD 00:00')
        : ''
      const endDate = req.query.endDate
        ? dayjs(req.query.endDate).format('YYYY-MM-DD 23:59')
        : ''

      let cases = `SELECT 
        count(*) AS Total, 
        sum(case when status = 0 then 1 else 0 end) AS Sent, 
        sum(case when status = 1 or status = 2 then 1 else 0 end) AS UnSent 
    FROM 
        sent_mail_histories sm `

      let responses = `SELECT 
          count(*) AS Total, 
          sum(case when status_feedback = '1' then 1 else 0 end) AS Responsed, 
          sum(case when status_feedback = '0' then 1 else 0 end) AS UnResponsed
      FROM 
          sent_mail_histories sm `

      let sqlTable = ` select
      *
  from
      customer_resources as rs
      left join (
          select
              --h.id,customer_id,
              c.customer_resource_id,
              sum(
                  case
                      when status = 0
                      or status = 2 then 1
                      else 0
                  end
              ) as sent,
              -- lấy dữ liệu đã gửi
              sum(
                  case
                      when status = 1 then 1
                      else 0
                  end
              ) as unsent,
              -- lấy dữ liệu chưa gửi gửi
              sum(
                  case
                      when status_feedback = '1' then 1
                      else 0
                  end
              ) as feedback,
              -- lấy dữ liệu đã phản hồi
              sum(
                  case
                      when status_feedback = '0' then 1
                      else 0
                  end
              ) as unfeedback -- lấy dữ liệu đã phản hồi
              --status_feedback,  send_date, status as st_sendmail
          from
              sent_mail_histories as h
              left join customers as c on h.customer_id = c.id `

      if (startDate && endDate) {
        cases += `WHERE sm.send_date BETWEEN '${startDate}' and '${endDate}'`
        responses += `WHERE sm.send_date BETWEEN '${startDate}' and '${endDate}'`
        sqlTable += ` WHERE h.send_date BETWEEN '${startDate}' and '${endDate}' `
      }

      let groupBy = ` Group by
      c.customer_resource_id 
) as tbl on rs.id = tbl.customer_resource_id order by feedback DESC NULLS LAST, sent DESC, rs.code ASC`

      const table = sqlTable + groupBy

      //Response: theo ngày tháng
      const getResponses = await sequelize.query(responses, {
        type: QueryTypes.SELECT,
      })

      const getTable = await sequelize.query(table, {
        type: QueryTypes.SELECT,
      })

      //Tổng số case thành công
      const getCases = await sequelize.query(cases, {
        type: QueryTypes.SELECT,
      })

      const DashBoardDataResponses = {
        responses: getResponses,
        table: getTable,
        cases: getCases,
      }

      return this.result(200, true, Message.SUCCESS, DashBoardDataResponses)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }

  async getCustomerResourceResponsed(req) {
    try {
      const startDate = req.query?.startDate
        ? DateUtils.convertStartDateToStringFullTime(req.query.startDate)
        : ''
      const endDate = req.query?.endDate
        ? DateUtils.convertEndDateToStringFullTime(req.query.endDate)
        : ''
      const sourceSelect = req.query?.resourceId

      const limitInput = req.query?.perPage
      const pageInput = req.query?.currentPage
      let bindParam = []

      let resourceResponsed = `
      SELECT     
          r.name as source_name, 
          c.name as customer_name,
          c.url,
          c.email,
          (case when cast(status_feedback as int) = 1 then 'Đã phản hồi' else 'Chưa phản hồi' end) as status_feedback,
          h.feedback_date
      FROM     
          public.sent_mail_histories h 
          inner JOIN public.customers  c on h.customer_id = c.id
          inner JOIN public.customer_resources r on c.customer_resource_id = r.id
      WHERE cast(status_feedback as int) = 1   `

      if (sourceSelect) {
        bindParam.push(sourceSelect)
        resourceResponsed += ` AND r.id = $${bindParam.length} `
      }

      if (startDate) {
        bindParam.push(startDate)
        resourceResponsed += ` AND h.send_date >= $${bindParam.length} `
      }

      if (endDate) {
        bindParam.push(endDate)
        resourceResponsed += ` AND h.send_date  <= $${bindParam.length}`
      }

      const getResourceResponsed = await sequelize.query(resourceResponsed, {
        bind: bindParam,
        type: QueryTypes.SELECT,
      })

      const totalRecord = getResourceResponsed.length

      if (!limitInput || !pageInput) {
        const result = await sequelize.query(resourceResponsed, {
          bind: bindParam,
          type: QueryTypes.SELECT,
        })

        const responsed = {
          customerResource: result,
        }
        return this.result(200, true, Message.SUCCESS, responsed)
      }

      const { totalPage, page, offset } = elementPaginate({
        totalRecord,
        page: pageInput,
        limit: limitInput,
      })
      const elements = await sequelize.query(
        resourceResponsed + ` LIMIT ${limitInput} OFFSET ${offset}`,
        { bind: bindParam, type: QueryTypes.SELECT }
      )

      const responsed = {
        customerResourceResponsed: elements,
        paginate: {
          totalRecord,
          totalPage,
          size: +limitInput,
          page: +page,
        },
      }

      return this.result(200, true, Message.SUCCESS, responsed)
    } catch (error) {
      throw {
        statusCode: 400,
        message: error?.message,
      }
    }
  }
}
export default new getTotalAssign()
