const db = require('@/dbInstance')

exports.storeMacd = (conn, data) => new Promise((resolve, reject) => {
  const query = "INSERT INTO macd SET ?"
  conn.query(query, data, (e) => {
    if (e) return reject('Failed to insert Macd into MYSQL')

    resolve()
  })
})


exports.getMacd = (interval, abbrev, count, offset) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT time_interval AS timeInterval,
      abbrev,
      date,
      settings,
      macd
    FROM macd
    WHERE time_interval = ?
      AND abbrev= ?
    ORDER BY date DESC
    LIMIT ?
    OFFSET ?
  `  
  const queryValues = [interval, abbrev, count, offset]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    conn.end()
    if (e) return reject(e)

    const parsedResults = []
    results.forEach((row) => {
      parsedResults.push(JSON.parse(row.macd))
    })

    resolve(parsedResults)
  })
})


exports.getMacdItemsBetweenDates = (interval, abbrev, startDate, endDate, _buffer) =>
  new Promise((resolve, reject) => 
{
  console.log('get macd items between dates')

  const buffer = _buffer * interval
  const query = `
    SELECT time_interval AS timeInterval,
      abbrev,
      date,
      settings,
      macd
    FROM macd
    WHERE time_interval = ?
      AND abbrev = ?
      AND date >= (? - INTERVAL ? MINUTE)
      AND date <= (? + INTERVAL ? MINUTE)
    ORDER BY date DESC
  `
  const queryValues = [interval, abbrev, startDate, buffer, endDate, buffer]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    conn.end()

    if (e) return reject(e)

    if (!results) return resolve([])

    const macdItems = []
    results.forEach((row) => {
      const macdData = JSON.parse(row.macd)
      const item = {
        timeInterval: row.timeInterval,
        abbrev: row.abbrev,
        date: macdData.date,
        rate: macdData.rate,
        macdLine: macdData.macdLine,
        macdLag: macdData.macdLag,
        histogram: macdData.macdHistogram
      }
      macdItems.push(item)
    })

    resolve(macdItems)
  })
})