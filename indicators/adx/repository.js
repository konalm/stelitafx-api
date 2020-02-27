
exports.storeAdx = (data, conn) => new Promise((resolve, reject) => {
  const query = "INSERT INTO adx SET ?"
  conn.query(query, data, (e) => {
    if (e) return reject('Failed to save ADX');

    resolve()
  })
})