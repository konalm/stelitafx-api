const db = require('../dbInstance')


exports.storeMovingAverageData = (abbrev, rate, movingAverageData, interval, conn) =>
  new Promise((resolve, reject) =>
{
  const movingAverageDataJSON = JSON.stringify(movingAverageData)

  const query = `
    INSERT INTO moving_average 
    (abbrev, rate, ma_data_json, time_interval) 
    VALUES ?
  `
  const queryValues = [
    [abbrev, rate, movingAverageDataJSON, interval]
  ]

  conn.query(query, [queryValues], (e) => {
    console.log(e)
    if (e) return reject('Error storing moving average data')

    resolve('Stored moving average data')
  })
})


exports.getMovingAverages = (
  abbrev, 
  interval, 
  amount, 
  offset = 0, 
  currencyRateSrc = 'currency_rate'
) => new Promise((resolve, reject) => {
  let query = `
    SELECT date, rate, ma_data_json AS maDataJson, time_interval
    FROM moving_average
    WHERE abbrev = ?
      AND time_interval = ?
    ORDER BY DATE DESC
    LIMIT ?
    OFFSET ?
  `
  const queryValues = [abbrev, interval, amount, offset]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    if (e) return reject(e)

    if (!results || results.length === 0) return resolve([]);

    const dataPoints = []
    results.forEach((result) => {
      const movingAverageData = JSON.parse(result.maDataJson)
      let dataPoint = {
        date: result.date,
        rate: result.rate,
        movingAverages: {}
      }
      movingAverageData.forEach((movingAverageRow) => {
        dataPoint.movingAverages[movingAverageRow.length] = movingAverageRow.movingAverage
      })

      dataPoints.push(dataPoint)
    })

    resolve(dataPoints)
  })
  conn.end()
})
