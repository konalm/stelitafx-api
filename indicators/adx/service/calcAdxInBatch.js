const  calcAdx = require('./calcAdx')

module.exports = (rates, index) => {
  const length = 150 

  if (rates.length < length - 1) return null 

  const relevantCandles= [...rates]
    .splice(index - length + 1, length)
    .map((x) => ({
      open: x.candle.o,
      close: x.candle.c,
      low: x.candle.l,
      high: x.candle.h
    }))

  return calcAdx(relevantCandles)
}