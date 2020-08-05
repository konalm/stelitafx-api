const getCachedCandles = require('./getCachedHistoricCandlesSinceDate')
const getHeikenAshiCandles = require('./heikenAshiCandles')

module.exports = async (gran, symbol, sinceDate) => {
  console.log('get heiken ashi candles since date')
  console.log(`gran .. ${gran}`)
  console.log(`symbol .. ${symbol}`)
  console.log(`since date .. ${sinceDate}`)

  const candles = await getCachedCandles(gran, symbol, sinceDate)
  const haCandles = getHeikenAshiCandles(candles)

  // console.log(`ha candles .. ${haCandles.length}`)

  return haCandles
}