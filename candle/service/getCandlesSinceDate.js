const { get } = require('@/services/oandaApiHttpRequest')
const { dateTs, minsAheadTs, minsAgoTs } = require('@/services/utils')


module.exports = async (fromDate, interval, abbrev) => {
  let fromDateTs = dateTs(fromDate)
 
  const candles = []
  while ( fromDateTs < minsAgoTs(new Date())(interval) ) {
    let partialCandles
    try {
      partialCandles = await getCandlesRequest(fromDateTs, interval, abbrev)
    } catch (e) {
      throw new Error(`Failed to get candles from Oanda api: ${e}`)
    }
    candles.push(...partialCandles)

    fromDateTs = minsAheadTs(candles[candles.length - 1].time)(interval)
  }

  return candles 
}


const getCandlesRequest = async (fromTs, interval, abbrev) => {
  const instrument = abbrev.replace("/", "_")
  const granularity = `M${interval}`
  const path = `instruments/${instrument}/candles?granularity=${granularity}&from=${fromTs}&count=5000`

  let response 
  try {
    response = await get(path)
  } catch (e) {
    throw new Error(e)
  }

  return response.candles
}
