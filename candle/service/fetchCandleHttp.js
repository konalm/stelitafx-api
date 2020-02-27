const axios = require('axios')
const env = require('@/env.js')

const API_URL = 'https://api-fxtrade.oanda.com/v3/'
const API_SECRET = env.OANDA_LIVE_API_SECRET;
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_SECRET}`
}


module.exports = (interval, abbrev) => new Promise(async(resolve, reject) => {
  const instrument = abbrev.replace("/", "_")
  const request = {
    method: 'GET',
    headers: HEADERS,
    url: `${API_URL}/instruments/${instrument}/candles?count=2&granularity=M${interval}`
  }

  let apiRexsponse
  try {
    apiResponse = await axios(request)
  } catch (e) {
    return reject(`Failed to fetch candle from Oanda for ${interval} ${abbrev}`)
  }

  const candle = apiResponse.data.candles.find((x) => x.complete)
  if (!candle) return reject('Failed to get any compete candles')

  const candleDate = new Date(candle.time)

  if (candleDate.getMinutes() % interval !== 0) {
    console.log('candle date matches up .. :)')
    return reject(
      `candle date ${candleDate} did not match up with passed interval ${interval}`
    )
  }
  
  return resolve(candle.mid)
})