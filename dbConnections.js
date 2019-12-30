const db = require('./dbInstance')

module.exports = (message) => new Promise((resolve, reject) => {
  const conn = db()
  conn.query('show processlist', (e, results) => {
    if (e) return reject('Failed to get db connections')

    console.log(`${message} .... ${results.length} CONNECTIONS FOUND`)
    resolve()
  })
  conn.end()
})