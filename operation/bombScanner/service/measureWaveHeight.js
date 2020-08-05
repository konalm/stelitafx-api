const calculatePip = require('@/services/calculatePip')

module.exports = (trend, candles, abbrev) => {
  const firstCandle = candles[0]
  const lastCandle = candles[candles.length - 1]

  if (trend === 'up') return calculatePip(firstCandle.low, lastCandle.high, abbrev)
  else return calculatePip(lastCandle.low, firstCandle.high, abbrev)
}