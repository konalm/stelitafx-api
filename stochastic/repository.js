const conn = require('../db')
const db = require('../dbInstance')

exports.saveStochastic = (abbrev, timeInterval, stochastic) => 
  new Promise((resolve, reject) => 
{
  console.log('repository, save stochastic !')
  const dbConn = db()

  const query = 'INSERT INTO stochastic_oscilator SET ?'
  const data = {
    abbrev,
    time_interval: timeInterval,
    stochastic
  }
  dbConn.query(query, data, (e) =>  {
    console.log('save stochastic, close connection')
    
    if (e) {
      reject(`Failed to save stochastic oscilator: ${e}`)
      dbConn.end()
      return
    }

    resolve()
    dbConn.end()
  })
})

exports.getStochastics = (abbrev, timeInterval, count, offset) => 
  new Promise((resolve, reject) => 
{
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

  console.log(query)

  console.log(queryValues)

  conn.query(query, queryValues, (e, results) => {
    console.log(e)
    if (e) return reject(`Failed to get stochastics`)

    resolve(results)
  })
})

exports.getLatestStochastic = (abbrev, interval ) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT stochastic 
    FROM stochastic_oscilator
    WHERE abbrev = ?
      AND time_interval = ?
    ORDER BY date DESC
    LIMIT 1
  `
  const queryValues = [abbrev, interval]

  conn.query(query, queryValues, (e, results) => {
    if (e) return reject(`Failed to get latest stochastic`)

    resolve(results[0].stochastic)
  })
})