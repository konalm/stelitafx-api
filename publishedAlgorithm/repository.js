// const conn = require('../db')
const db = require('../dbInstance')

exports.getAll = () => new Promise((resolve, reject) => {
  const dbConn = db()
  const query = `
    SELECT prototype_no AS prototypeNo, time_interval AS timeInterval
    FROM published_algorithm
  `
  dbConn.query(query, (e, results) => {
    dbConn.end()
    if (e) return reject(e)

    resolve(results)
  })
})

exports.get = (prototypeNo, timeInterval) => new Promise((resolve, reject) => {
  const dbConn = db()
  const query = `
    SELECT prototype_no AS prototypeNo, time_interval AS timeInterval
    FROM published_algorithm
    WHERE prototype_no = ?
      AND time_interval = ?
    LIMIT 1
  `
  const queryValues = [prototypeNo, timeInterval]

  dbConn.query(query, queryValues, (e, results) => {
    dbConn.end()
    if (e) return reject(e)

    resolve (results)
  })
})