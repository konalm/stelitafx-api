const { get } = require('@/services/oandaApiHttpRequest')
const { dateTs, minsAheadTs, minsAgoTs } = require('@/services/utils')
const dateMarketLastOpen = require('@/services/dateMarketLastOpen')

module.exports = async (fromDate, endDate, gran, abbrev) => {
  let fromDateTs = dateTs(fromDate)

  const granSymbol = gran.substring(0,1)
  const interval =  granSymbol === 'H' 
    ? parseInt(gran.substring(1,2)) * 60 
    : parseInt(gran.substring(1,2))
  
  const candles = []
  while (fromDateTs < minsAgoTs(dateMarketLastOpen())(interval * 50)) {
    let partialCandles
    try {
      partialCandles = await getCandlesRequest(fromDateTs, gran, abbrev)
    } catch (e) {
      throw new Error(`Failed to get candles from Oanda api: ${e}`)
    }
    candles.push(...partialCandles)

    fromDateTs = minsAheadTs(candles[candles.length - 1].time)(interval)
  }

  return candles 
}


const getCandlesRequest = async (fromTs, gran, abbrev) => {
  const instrument = abbrev.replace("/", "_")
  // const instrument = 'Bitcoin'
  const path = `instruments/${instrument}/candles?granularity=${gran}&from=${fromTs}&count=5000`

  console.log(path)

  let response 
  try {
    response = await get(path)
  } catch (e) {
    throw new Error(e)
  }

  return response.candles
}
