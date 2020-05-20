const axios = require('axios')
const { dateTs, minsAheadTs, minsAgoTs, minsAgo } = require('@/services/utils')
const dateMarketLastOpen = require('@/services/dateMarketLastOpen')
const cryptoGranCoverter = require('@/services/cryptoGran')
const intervalFromGran = require('@/services/intervalFromGran')

const URL = 'https://api-pub.bitfinex.com/v2/'

exports.fetchCandles = async (currencyPair, gran, sinceDate, limit) => {
  const cryptoGran = cryptoGranCoverter(gran)
  const interval = intervalFromGran(gran)
  const path = `candles/trade:${cryptoGran}:t${currencyPair}/hist`

  let fromDate = new Date(sinceDate)
  let fromDateMilliSecs = fromDate.getTime()
  const end = minsAgo(new Date())(interval)

  const candles = []
  // while (fromDate < end) {
    console.log('while')

    let queryParams = "?sort=1"
    if (limit) queryParams += `&limit=${limit}`
    if (sinceDate) queryParams += `&start=${fromDateMilliSecs}`

    let partialCandles
    try {
      partialCandles = await axios.get(`${URL}${path}${queryParams}`)
    } catch (e) {
      console.log(e)
    }
    candles.push(...partialCandles.data)

    const lastDateMillisecs = candles[candles.length - 1][0]
 
    fromDate = new Date(lastDateMillisecs)
    fromDate.setMinutes(fromDate.getMinutes() + interval)
    fromDateMilliSecs = fromDate.getTime()
  // }

  return mapCandles(candles)
}


const mapCandles = (candles) => candles.map((x) => ({
  date: new Date(x[0]),
  exchange_rate: x[2],
  rate: x[2],
  candle: {
    o: x[1],
    c: x[2],
    h: x[3],
    l: x[4],
    volume: x[5]
  }
}))