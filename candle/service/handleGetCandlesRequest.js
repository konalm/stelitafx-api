const symbolToAbbrev = require('@/services/symbolToAbbrev')
const { getCandles, getCandlesBetweenDates } = require('../repository')


module.exports = async (reqParams, reqQuery) => {
  const { interval, symbol } = reqParams
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
    candles = await getCandles(interval, abbrev, count, offset)
  }

  return candles.sort((a, b) => new Date(a.date) - new Date(b.date))
}