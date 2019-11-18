const conn = require('../db')

exports.getAll = () => new Promise((resolve, reject) => {
  const query = `
    SELECT prototype_no AS prototypeNo, time_interval AS timeInterval
    FROM published_algorithm
  `
  conn.query(query, (e, results) => {
    if (e) return reject(e)

    resolve(results)
  })
})

exports.get = (prototypeNo, timeInterval) => new Promise((resolve, reject) => {
  const query = `
    SELECT protype_no AS prototypeNo, time_interval AS timeInterval
    FROM published_algorithm
    WHERE prototype_no ?
    AND time_interval = ?
    LIMIT 1
  `
  const queryValues = [prototypeNo, timeInterval]

  conn.query(query, queryValues, (e, results) => {
    if (e) return reject(e)

    resolve (results)
  })
})