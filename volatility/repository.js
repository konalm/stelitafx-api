const db = require('../dbInstance')
const formatMysqlDate = require('../services/formatMysqlDate')

exports.storeVolatility = (conn, interval, abbrev, volatility) =>
  new Promise((resolve, reject) => 
{
  const query = 'INSERT INTO volatility SET ?'
  const data = {
    abbrev,
    time_interval: interval,
    volatility
  }
  conn.query(query, data, (e) => {
    console.log(e)
    if (e) return reject(`Failed to store volatiliy for ${abbrev} ${interval}`)

    resolve()
  })
})


exports.getVolatilityBetweenDates = (interval, startDate, toDate) => 
  new Promise((resolve, reject) =>
{
  const conn = db()

  let query = `
    SELECT abbrev, date, volatility
    FROM volatility
    WHERE time_interval = ?
      AND date >= ?
      AND date <= ?
  `
  const queryValues = [interval, formatMysqlDate(startDate), formatMysqlDate(toDate)]

  conn.query(query, queryValues, (e, results) => {
    conn.end()

    if (e) return reject(e)

    resolve(results)
  })
})