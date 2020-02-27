const db = require('@/dbInstance');
const config = require('@/config');
const calcMacd = require('./calcMacd')
const { storeMacd } = require('../repository')
const storeCache = require('./storeCache')

module.exports = (interval) => new Promise((resolve, reject) => {
  console.log(`store MACD .. interval ${interval}`)

  const conn = db()

  const storeMacdForAbbrevPromises = []
  config.MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/${config.QUOTE_CURRENCY}`
    storeMacdForAbbrevPromises.push(storeMacdForAbbrev(interval, abbrev, conn))
  })

  Promise.all(storeMacdForAbbrevPromises)
    .then(() => {
      console.log('stored macd for all currencies')
      conn.end()
      resolve()
    })
    .catch((e) => {
      console.log(`failed to store macd for interval .. ${interval}`)
    })
})


const storeMacdForAbbrev = (interval, abbrev, conn) => 
  new Promise(async (resolve, reject ) => 
{
  let macd 
  try {
    macd = await calcMacd(interval, abbrev)
  } catch (e) {
    console.log(e)
    console.log(`Failed to calculate macd`)
    return reject()
  }

  const settings = JSON.stringify({
    fastEma: 12,
    slowEma: 26,
    macdEma: 9
  })

  const macdModel = {
    time_interval: interval,
    abbrev,
    settings,
    macd: JSON.stringify(macd)
  }

  console.log('macd model >>>')
  console.log(macdModel)

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