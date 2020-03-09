const config = require('@/config');
const db = require('@/dbInstance')
const getAbbrevCandles = require('@/candle/service/getCache')
const calcAdx = require('./calcAdx')
const { storeAdx } = require('../repository')

 
module.exports = (interval) => new Promise((resolve) => {
  const conn = db()

  const currencyStoreAdxPromises = []
  config.MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/${config.QUOTE_CURRENCY}`
    currencyStoreAdxPromises.push(storeAdxForAbbrev(interval, abbrev, conn))
  })

  Promise.all(currencyStoreAdxPromises)
    .then(() => {
      console.log('Stored ADX for all currencies')
      conn.end()
      resolve()
    })
    .catch((e) => {
      console.log('Failed >>>')
      console.log(e)
      conn.end()
      resolve()
    })
})


const storeAdxForAbbrev = (interval, abbrev, conn) => 
  new Promise(async (resolve, reject) => 
{
  /* Get abbrev's last 150 candles */
  let candles 
  try {
    candles = await getAbbrevCandles(interval, abbrev, 164)
  } catch (e) {
    console.log(e)
    return reject('Faled to get abbrev periods')
  }

  /* Order candles by earliest first */
  candles.sort((a, b) => new Date(a.date) - new Date(b.date))

  const adx = calcAdx(candles, interval, abbrev)

  const adxModel = {
    time_interval: interval, 
    abbrev,
    plus_di: adx.plusDi,
    minus_di: adx.minusDi,
    adx: adx.adx
  }
  storeAdx(adxModel, conn)
    .then(() => {
      resolve()
    })
    .catch(() => {
      reject('Failed to store ADX model')
    })
})