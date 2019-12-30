
exports.storeMovingAverageData = (abbrev, rate, movingAverageData, interval, conn) =>
  new Promise((resolve, reject) =>
{
  const movingAverageDataJSON = JSON.stringify(movingAverageData)

  const query = 'INSERT INTO moving_average (abbrev, rate, ma_data_json) VALUES ?'
  const queryValues = [
    [abbrev, rate, movingAverageDataJSON, interval]
  ]

  conn.query(query, [queryValues], (e) => {
    if (e) return reject('Error storing moving average data')

    resolve('Stored moving average data')
  })
})