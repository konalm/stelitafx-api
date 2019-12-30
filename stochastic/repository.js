const conn = require('../db')
const db = require('../dbInstance')
const dbConnections = require('../dbConnections')


exports.saveStochastic = (abbrev, timeInterval, stochastic, conn) => 
  new Promise((resolve, reject) => 
{
  const query = 'INSERT INTO stochastic_oscilator SET ?'
  const data = {
    abbrev,
    time_interval: timeInterval,
    stochastic
  }
  conn.query(query, data, (e) =>  {
    if (e) return reject(`Failed to save stochastic oscilator: ${e}`)
    resolve()
  })
})

exports.getStochastics = (abbrev, timeInterval, count, offset) => 
  new Promise((resolve, reject) => 
{
  const dbConn = db()
  const query = `
    SELECT stochastic, date 
    FROM stochastic_oscilator 
    WHERE abbrev = ?
    AND time_interval = ?
    ORDER BY date DESC
    LIMIT ?
    OFFSET ?
  `
  const queryValues = [abbrev, timeInterval, parseInt(count), parseInt(offset)]

  dbConn.query(query, queryValues, (e, results) => {
    if (e) return reject(`Failed to get stochastics`)

    resolve(results)
  })
  dbConn.end()
})


exports.getLatestStochastic = (abbrev, interval, limit = 1) => 
  new Promise(async(resolve, reject) => 
{
  // await dbConnections('get latest stochastic')

  const dbConn = db()
  const query = `
    SELECT stochastic 
    FROM stochastic_oscilator
    WHERE abbrev = ?
      AND time_interval = ?
    ORDER BY date DESC
    LIMIT ?
  `
  const queryValues = [abbrev, interval, limit]

  dbConn.query(query, queryValues, (e, results) => {
    if (e) return reject(`Failed to get latest stochastic`)

    if (limit === 1) return resolve(results[0].stochastic)
    resolve(results.map(x => x.stochastic))
  })
  dbConn.end()
})


exports.getStochasticsBetweenDates = (abbrev, interval, startDate, endDate, buffer) => 
  new Promise((resolve, reject) => 
{
  const dbConn = db()
  const intervalBuffer = buffer * interval
  const query = `
    SELECT stochastic, date
    FROM stochastic_oscilator
    WHERE abbrev = ?
      AND time_interval = ?
      AND date >= (? - INTERVAL ? MINUTE)
      AND date <= (? + INTERVAL ? MINUTE)
    ORDER BY date DESC
  `
  const queryValues = [abbrev, interval, startDate, intervalBuffer, endDate, intervalBuffer]

  dbConn.query(query, queryValues, (e, results) => {
    if (e) return reject(e)

    resolve(results)
  })
  dbConn.end()
})