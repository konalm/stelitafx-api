const db = require('@/dbInstance');
const config = require('@/config');
const calcMacd = require('./calcMacd')
const { storeMacd } = require('../repository')
const storeCache = require('./storeCache')
const getCurrencyRates = require('@/currencyRates/services/getCurrencyRates')


module.exports = (interval) => new Promise((resolve) => {
  const conn = db()

  const storeMacdForAbbrevPromises = []
  config.MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/${config.QUOTE_CURRENCY}`
    storeMacdForAbbrevPromises.push(storeMacdForAbbrev(interval, abbrev, conn))
  })

  Promise.all(storeMacdForAbbrevPromises)
    .then(() => {
      conn.end()
      resolve()
    })
    .catch((e) => {
      console.log(`Failed to store macd for interval .. ${interval}`)
      resolve()
    })
})


const storeMacdForAbbrev = (interval, abbrev, conn) => 
  new Promise(async (resolve, reject ) => 
{
  const fastEma = 12
  const slowEma = 26
  const macdEma = 9
  const smoothing = 150

  /* Get abbrevs required amount of rates */
  let currencyRates
  try {
    const count = slowEma + macdEma + smoothing;
    currencyRates = await getCurrencyRates(interval, abbrev, count, false)
    currencyRates = currencyRates.map((x) => ({
      date: x.date,
      rate: parseFloat(x.exchange_rate)
    }))
  } catch (e) {
    return reject('Failed to get currencu rates for macd')
  }

  /* Order rates by earliest first */
  currencyRates.sort((a, b) => new Date(a.date) - new Date(b.date))

  let macd 
  try {
    macd = await calcMacd(currencyRates)
  } catch (e) {
    console.log(e)
    console.log(`Failed to calculate macd`)
    return reject()
  }

  const settings = JSON.stringify({
    fastEma,
    slowEma,
    macdEma
  })

  const macdModel = {
    time_interval: interval,
    abbrev,
    settings,
    macd: JSON.stringify(macd)
  }

  // console.log('macd model >>>')
  // console.log(macdModel)

  try {
    storeMacd(conn, macdModel)
  } catch (e) {
    return reject(e)
  }

  try {
    storeCache(interval, abbrev, macdModel)
  } catch (e) {
    return reject(`Failed to store cache`)
  }

  resolve()
})