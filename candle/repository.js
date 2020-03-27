const db = require('@/dbInstance')

exports.insertCandle = (interval, abbrev, candle, conn) => 
  new Promise((resolve, reject) => 
{
  const query = 'INSERT INTO candle SET ?'
  const data = {
    time_interval: interval,
    abbrev,
    open: candle.o,
    low: candle.l,
    high: candle.h,
    close: candle.c
  }

  conn.query(query, data, (e) => {
    console.log(e)
    if (e) return reject('Failed to insert candle into MYSQL')
    
    resolve()
  })
})


exports.getCandles = async (interval, abbrev, count, offset) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT time_interval AS timeInterval,
      abbrev,
      date,
      open,
      low,
      high,
      close
    FROM candle
    WHERE time_interval = ?
      AND abbrev = ?
    ORDER BY date DESC
    LIMIT ?
    OFFSET ?
  `
  const queryValues = [interval, abbrev, count, offset]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    conn.end()
    if (e) return reject(e)

    resolve(results)
  })
})


exports.getCandlesBetweenDates = async (interval, abbrev, startDate, endDate, _buffer) => 
  new Promise((resolve, reject) => 
{
  const buffer = _buffer * interval 
  const query = `
    SELECT date, 
      open, 
      low,
      high,
      close
    FROM candle
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

    resolve(results)
  })
})