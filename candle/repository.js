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