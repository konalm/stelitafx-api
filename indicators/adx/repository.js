const db = require('@/dbInstance')
const formatMysqlDate = require('@/services/formatMysqlDate')

exports.storeAdx = (data, conn) => new Promise((resolve, reject) => {
  const query = "INSERT INTO adx SET ?"
  conn.query(query, data, (e) => {
    if (e) return reject('Failed to save ADX');

    resolve()
  })
})


exports.getAdx = (interval, abbrev, count, offset) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT time_interval AS timeInterval,
      abbrev,
      date,
      plus_di AS plusDi,
      minus_di AS minusDi,
      adx
    FROM adx
    WHERE time_interval = ?
      AND abbrev = ?
    ORDER By date DESC
    LIMIT ?
    OFFSET ?
  `
  const queryValues = [interval, abbrev, count, offset]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    conn.end()
    if (e) return reject(e)

    resolve(results)
  })
})


exports.getAdxItemsBetweenDates = (interval, abbrev, startDate, endDate, _buffer) =>
  new Promise((resolve, reject) =>
{
  console.log('get adx items between dates')

  const buffer = _buffer * interval 
  const query = `
    SELECT date, 
      plus_di AS plusDi, 
      minus_di AS minusDi,
      adx
    FROM adx
    WHERE time_interval = ?
      AND abbrev = ?
      AND date >= (? - INTERVAL ? MINUTE)
      AND date <= (? + INTERVAL ? MINUTE)
    ORDER BY date DESC
  `
  const queryValues = [interval, abbrev, startDate, buffer, endDate, buffer]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    conn.end()
    
    if (e) return reject(e)

    if (!results) return resolve([])

    resolve(results)
  })
})