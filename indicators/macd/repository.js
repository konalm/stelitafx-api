exports.storeMacd = (conn, data) => new Promise((resolve, reject) => {
  const query = "INSERT INTO macd SET ?"
  conn.query(query, data, (e) => {
    if (e) return reject('Failed to insert Macd into MYSQL')

    resolve()
  })
})