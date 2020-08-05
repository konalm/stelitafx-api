const fs = require('fs')

module.exports = async (gran, symbol, sinceDate) => {
  const filePath = `./cache/historicCandles/${gran}/${symbol}.JSON`
  const candles = JSON.parse(await fs.readFileSync(filePath, 'utf8'))

  const mappedCandles = candles.map((x) => ({
    date: new Date(x.date),
    open: parseFloat(x.candle.o),
    low: parseFloat(x.candle.l),
    high: parseFloat(x.candle.h),
    close: parseFloat(x.candle.c)
  }))


  return mappedCandles.filter((x) => new Date(x.date) > new Date(sinceDate))
}