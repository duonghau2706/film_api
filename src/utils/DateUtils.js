import moment from 'moment'

class DateUtils {
  constructor() {}

  convertStartDateToStringFullTime(startDate) {
    if (!startDate) {
      return null
    }
    var startDate = moment(startDate).format('YYYY-MM-DD 00:00')

    return startDate
  }

  convertEndDateToStringFullTime(endDate) {
    if (!endDate) {
      return null
    }
    var endDate = moment(endDate).format('YYYY-MM-DD 23:59')

    return endDate
  }

  // date -> YYYY-MM-DD HH:mm:ss
  convertDateToStringFullTime(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYY-MM-DD HH:mm:ss')
  }

  // date -> YYYY-MM-DD HH:mm:ss
  convertDateToStringFullTimeUTC(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).tz('UTC').format('YYYY-MM-DD HH:mm:ss')
  }

  // date -> YYYYMMDDHHmmssSSS
  convertDateToStringYYYYMMDDHHmmssSSS(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYYMMDDHHmmssSSS')
  }

  // date -> YYYY-MM-DD HH:mm
  convertDateToStringDateTime(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYY-MM-DD HH:mm')
  }

  convertDateToStringDateTimeUTC(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).tz('UTC').format('YYYY-MM-DD HH:mm')
  }

  // date -> YYYY-MM
  convertDateToStringMonth(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYY-MM')
  }

  // date -> YYYY-MM-DD
  convertDateToStringYear(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYY-MM-DD')
  }

  // YYYY-MM-DD HH:mm:ss -> YYYY-MM-DD
  convertFullTimeStringDate(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYY-MM-DD')
  }

  // YYYY-MM-DD HH:mm:ss -> YYYY-MM-DD
  convertFullTimeStringDate3(dateStr) {
    if (!dateStr) {
      return null
    }

    return dateStr.split(' ')[0]
  }

  convertFullTimeStringDate2(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYY/MM/DD')
  }
  // YYYY-MM-DD HH:mm:ss -> HH:mm
  convertFullTimeToStringHourTime(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('HH:mm')
  }

  // 1454521239279 -> YYYY-MM-DD HH:mm:ss
  convertLongTimeToStringDate(dateTime) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format('YYYY-MM-DD HH:mm:ss')
  }

  // sourceTime: YYYY-MM-DD HH:mm, disTime: YYYY-MM-DD HH:mm
  compareStrinDateTime(sourceTime, disTime) {
    if (!sourceTime || !disTime) {
      return false
    }

    if (moment(sourceTime) < moment(disTime)) {
      return true
    } else {
      return false
    }
  }

  compareStringDateTimeGte(sourceTime, disTime) {
    if (!sourceTime || !disTime) {
      return false
    }

    if (moment(sourceTime) <= moment(disTime)) {
      return true
    } else {
      return false
    }
  }

  convertFullTimeStringDate(dateTime, format) {
    if (!dateTime) {
      return null
    }
    return moment(dateTime).format(format)
  }

  // convert string YYYY-MM-DD HH:mm -> HH:mm
  convertStringFullTimeToHourTime(str) {
    if (!str) {
      return ''
    }

    var result = str.slice(-5)
    return result
  }

  getDifferenceInDays(date1, date2) {
    const diffInMs = Math.abs(date2 - date1)
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  }

  getDifferenceInHours(date1, date2) {
    const diffInMs = Math.abs(date2 - date1)
    return +parseFloat(diffInMs / (1000 * 60 * 60)).toFixed(2)
  }

  getDifferenceInMinutes(date1, date2) {
    const diffInMs = Math.abs(date2 - date1)
    return +parseFloat(Math.ceil(diffInMs / (1000 * 60))).toFixed(2)
  }

  getDifferenceInSeconds(date1, date2) {
    const diffInMs = Math.abs(date2 - date1)
    return +parseFloat(Math.ceil(diffInMs / 1000)).toFixed(2)
  }

  convertMinuteToHour(numMinute) {
    return +parseFloat(numMinute / 60).toFixed(2)
  }

  getDaysBetweenDates(startDate, endDate) {
    let now = startDate.clone(),
      dates = []

    while (now.isSameOrBefore(endDate)) {
      dates.push(now.format('YYYY-MM-DD'))
      now.add(1, 'days')
    }
    return dates
  }

  compareStringDateTimeOverlapShift(from, entity, to) {
    if (!from || !entity || !to) {
      return false
    }

    if (moment(entity).isBetween(from, to, null, '[]')) {
      return true
    } else {
      return false
    }
  }

  compareStringDateTimeOverlapIsSameShift(from, entity, to) {
    if (!from || !entity || !to) {
      return false
    }

    if (moment(entity).isBetween(from, to, null, '()')) {
      return true
    } else {
      return false
    }
  }

  addDays(dateStr, days) {
    var result = new Date(dateStr)
    result.setDate(result.getDate() + days)
    return result
  }

  addMonths(date, months) {
    const beforeDate = new Date(date)
    beforeDate.setMonth(beforeDate.getMonth() + months)
    return beforeDate
  }

  // compare string date
  compareIsSame(dateStrX, dateStrY) {
    if (!dateStrX || !dateStrY) {
      return false
    }

    if (moment(dateStrX).isSame(dateStrY)) {
      return true
    } else {
      return false
    }
  }

  convertDateToUTC(date) {
    if (!date) {
      return null
    }
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      )
    )
  }

  convertDateToUTCNotTime(date) {
    if (!date) {
      return null
    }
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
  }

  formatDate(string, sign = '/') {
    const time = new Date(string)
    const timeStr =
      time.getFullYear() +
      sign +
      ('00' + (time.getMonth() + 1)).slice(-2) +
      sign +
      ('00' + time.getDate()).slice(-2)

    return timeStr
  }

  sortStringDateVacationAsc(arr) {
    const sortedArray = arr.sort(
      (a, b) =>
        new moment(a.added).format('YYYYMMDD') -
        new moment(b.added).format('YYYYMMDD')
    )
    return sortedArray
  }
  // HH:mm
  convertHHmmTomm(time) {
    if (!time) {
      return 0
    }

    return moment.duration(time).asHours()
  }

  getAllMonthInDuration(start, end) {
    var dateStart = moment(start)
    var dateEnd = moment(end)
    var timeValues = []

    while (
      dateEnd > dateStart ||
      dateStart.format('M') === dateEnd.format('M')
    ) {
      timeValues.push(dateStart.format('YYYY-MM-01'))
      dateStart.add(1, 'month')
    }
    timeValues.shift()
    return timeValues
  }

  countDaysInDuration(start, end) {
    var dateStart = moment(start)
    var dateEnd = moment(end)
    var timeValues = []

    while (dateEnd > dateStart) {
      timeValues.push(dateStart.format('YYYY-MM-dd'))
      dateStart.add(1, 'days')
    }
    return timeValues.length
  }

  // yyyy-MM-dd -> yyyy-MM
  convertStringDateTime(timeStr) {
    if (!timeStr) {
      return null
    }

    return moment(timeStr).format('YYYY-MM')
  }

  getInfoDate(date) {
    if (!date) {
      return null
    }
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      yearMonth: `${date.getFullYear()}-${('00' + (date.getMonth() + 1)).slice(
        -2
      )}`,
    }
  }

  // YYYY-MM -> number
  getDayInMonth(date) {
    if (!date) {
      return null
    }
    return moment(date, 'YYYY-MM').daysInMonth()
  }

  // YYYY-MM-DD -> boolean
  isBeforeExpiredDate(start, end) {
    const startDate = moment(start)
    const endDate = moment(end)

    const diff = endDate.diff(startDate)
    if (diff < 0) return false

    return true
  }
}

export default new DateUtils()
