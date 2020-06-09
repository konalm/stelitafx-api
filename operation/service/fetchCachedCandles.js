const fs = require('fs')

module.exports = async (gran, symbol, sinceDate) => {
  let candles
  try {
    candles = JSON.parse(
      await fs.readFileSync(`../../cache/historicCandles/${gran}/${symbol}.JSON`)
    )
  } catch (e) {
    return console.log(`Failed to read candles from cache: ${e}`)
  }

  return candles
    .map((x) => ({
      date: x.date, 
      open: parseFloat(x.candle.o),
      close: parseFloat(x.candle.c),
      high: parseFloat(x.candle.h),
      low: parseFloat(x.candle.l)
    }))
    .filter((x) => 
      new Date(x.date) >= new Date(sinceDate)
    )
}