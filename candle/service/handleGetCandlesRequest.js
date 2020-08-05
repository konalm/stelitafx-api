const symbolToAbbrev = require('@/services/symbolToAbbrev')
const { getCandles, getCandlesBetweenDates } = require('../repository')
const getCachedCandles = require('./getCachedHistoricCandles')
const intervalFromGran = require('@/services/intervalFromGran')


module.exports = async (reqParams, reqQuery) => {
  const { gran, symbol } = reqParams
  const abbrev = symbolToAbbrev(symbol)
  const count = parseInt(reqQuery.count) || 50
  const offset = parseInt(reqQuery.offset) || 0
  const startDate = reqQuery.startDate || null 
  const endDate = reqQuery.endDate || null
  const buffer = reqQuery.buffer || 50
  let candles = []

  /* Get candles between date */
  if (startDate && endDate) {
    candles = await getCandlesBetweenDates(interval, abbrev, startDate, endDate, buffer)
  } 
  /* Get latest candles */
  else {
    candles = await getCachedCandles(gran, symbol, count, offset)
  }

  console.log(`candles .. ${candles.length}`)

  const mappedCandles = candles.map((x) => ({
    date: new Date(x.date),
    open: parseFloat(x.candle.o),
    low: parseFloat(x.candle.l),
    high: parseFloat(x.candle.h),
    close: parseFloat(x.candle.c)
  }))

  return mappedCandles.sort((a, b) => new Date(a.date) - new Date(b.date))
}