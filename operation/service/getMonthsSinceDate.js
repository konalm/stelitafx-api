
const utils = require('@/services/utils')
module.exports  = (sinceDate) => {
  const s = utils.getDate(sinceDate)
  const sinceYear = s.getFullYear()
  const sinceMonth = s.getMonth()
  const now = new Date()

  const monthDates = []
  /* loop every year */ 
  for (let y = sinceYear; y <= now.getFullYear(); y++) {
    /* loop every month */ 
    for (let m = 0; m < 12; m++) {
      if (y === now.getFullYear() && m > now.getMonth()) break

      if (y === sinceYear && m < sinceMonth) continue 

      monthDates.push(setToBeginningOfMonth(y, m))
    }
  }

  return monthDates
}


const setToBeginningOfMonth = (year, month) => new Date(Date.UTC(year, month, 1))