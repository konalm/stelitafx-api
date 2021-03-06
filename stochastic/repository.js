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
    if (e) {
      console.log('Failed to save stochastic')
      return reject(`Failed to save stochastic oscilator: ${e}`)
    }

    resolve()
  })
})

// exports.getStochastics = (abbrev, timeInterval, count, offset) => 
//   new Promise((resolve, reject) => 
// {
//   console.log('A')

//   const dbConn = db()
//   const query = `
//     SELECT stochastic, date 
//     FROM stochastic_oscilator 
//     WHERE abbrev = ?
//     AND time_interval = ?
//     ORDER BY date DESC
//     LIMIT ?
//     OFFSET ?
//   `
//   const queryValues = [abbrev, timeInterval, parseInt(count), parseInt(offset)]

//   console.log(query)
//   console.log(queryValues)

//   dbConn.query(query, queryValues, (e, results) => {
//     dbConn.end()
//     if (e) return reject(`Failed to get stochastics`)

//     resolve(results)
//   })
// })


exports.getStochastics = (abbrev, interval, amount, offset = 1) =>
  new Promise((resolve, reject) => 
{
  let query = `
    SELECT stochastic, date 
    FROM stochastic_oscilator 
    WHERE abbrev = ?
    AND time_interval = ?
    ORDER BY date DESC
    LIMIT ?
    OFFSET ?
  `
  const queryValues = [abbrev, interval, amount, offset]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    if (e) return reject(e)

    if (amount === 1) return resolve(results[0])

    resolve(results)
  })
})


exports.getLatestStochastic = (abbrev, interval, limit = 1) => 
  new Promise(async(resolve, reject) => 
{
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
    dbConn.end()
    if (e) return reject(`Failed to get latest stochastic`)

    if (limit === 1) return resolve(results[0].stochastic)
    resolve(results.map(x => x.stochastic))
  })
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
    dbConn.end()
    if (e) return reject(e)

    resolve(results)
  })
})