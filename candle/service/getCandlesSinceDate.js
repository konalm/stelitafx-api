const { get } = require('@/services/oandaApiHttpRequest')
const { dateTs, minsAheadTs, minsAgoTs } = require('@/services/utils')
const dateMarketLastOpen = require('@/services/dateMarketLastOpen')

module.exports = async (fromDate, endDate, gran, abbrev) => {
  let fromDateTs = dateTs(fromDate)

  const granSymbol = gran.substring(0,1)
  const interval =  granSymbol === 'H' 
    ? parseInt(gran.substring(1,2)) * 60 
    : parseInt(gran.substring(1,2))
  
  console.log(`interval .. ${interval}`)
  console.log(`gran symbol .. ${granSymbol}`)

  const candles = []
  while (fromDateTs < minsAgoTs(dateMarketLastOpen())(interval * 50)) {
    console.log('while')

    let partialCandles
    try {
      partialCandles = await getCandlesRequest(fromDateTs, gran, abbrev)
    } catch (e) {
      throw new Error(`Failed to get candles from Oanda api: ${e}`)
    }
    candles.push(...partialCandles)

    fromDateTs = minsAheadTs(candles[candles.length - 1].time)(interval)

    // console.log('from date >>')
    // console.log(candles[candles.length - 1].time)
    // console.log('market last open')
    // console.log(dateMarketLastOpen())
  }

  return candles 
}


const getCandlesRequest = async (fromTs, gran, abbrev) => {
  const instrument = abbrev.replace("/", "_")
  const path = `instruments/${instrument}/candles?granularity=${gran}&from=${fromTs}&count=5000`

  let response 
  try {
    response = await get(path)
  } catch (e) {
    throw new Error(e)
  }

  // console.log('responsev>>>>>>>>>>>>>>>>')
  // console.log(response)

  // response.candles.forEach((x, i ) => {
  //   console.log(x.time)

  //   if (i > 100) process.exit()
  // })

  // process.exit()

  return response.candles
}
