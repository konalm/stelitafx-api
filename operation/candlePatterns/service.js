const fs = require('fs');


exports.fetchCandles = async (symbol, sinceDate) => {
  let allCandles 
  try {
    allCandles = JSON.parse( 
      await fs.readFileSync(`cache/historicCandles/${symbol}.JSON`, 'utf8')
    )
  } catch (e) {
    console.log(e)
    return console.error('Failed to read candles from cache')
  }

  return allCandles
    .filter((x) => new Date(x.date) >= new Date(sinceDate))
    .map((x) => {
      const d = new Date(x.date)
      d.setHours(d.getHours() + 1)
      
      return {
        date: d,
        open: parseFloat(x.candle.o),
        high: parseFloat(x.candle.h),
        low: parseFloat(x.candle.l),
        close: parseFloat(x.candle.c)
      }
    })
};


const candleBody = candle => Math.abs(candle.close - candle.open)

const candleLength = candle => candle.high - candle.low


const candleType = candle => {
  if (candle.close > candle.open) return 'bull'
  if (candle.close < candle.open) return 'bear'
  
  return 'neutral'
}


exports.candleStats = _candle => {
  const candle = {
    open: parseFloat(_candle.o),
    high: parseFloat(_candle.h),
    low: parseFloat(_candle.l),
    close: parseFloat(_candle.c)
  }

  return {
    // date: candle.date,
    type: candleType(candle),
    body: candleBody(candle),
    size: candleLength(candle),
    ...candle
  }
}


exports.isTimesBigger = (a, b, times) => {
  return a > (b * times)
}