const config = require('@/config')
const fetchCandleHttp = require('./fetchCandleHttp')
const INTERVALS = config.TIME_INTERVALS
const CURRENCIES = config.MAJOR_CURRENCIES
const { insertCandle } = require('../repository')
const storeCache = require('./storeCache')
const db = require('@/dbInstance')



module.exports = (min) => new Promise((resolve, reject) => {
  const populateCandleForIntervalPromises = []
  INTERVALS.forEach((interval) => {
    if (min % interval === 0) {
      populateCandleForIntervalPromises.push(populateCandleForInterval(interval))
    }
  })

  Promise.all(populateCandleForIntervalPromises)
    .then(() => {
      resolve()
    })
    .catch(() => {
      console.log('populate candles failed')
      resolve()
    })
})



const populateCandleForInterval = (interval) => new Promise((resolve, reject) => {
  const conn = db()

  const populateCandleForIntervalAbbrevPromises = []
  CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/USD`
    populateCandleForIntervalAbbrevPromises.push(
      poulateCandleForIntervalAbbrev(interval, abbrev, conn)
    )
  })

  Promise.all(populateCandleForIntervalAbbrevPromises)
    .then(() => {
      // console.log('populate candle for all abbrevs !!!!!!!')
      conn.end()
      resolve()
    })
    .catch((e) => {
      console.log(e)
      console.log(`Failed to popuate candle for ${interval}`)
      conn.end()
      reject(`Failed to popuate candle for ${interval}`)
    })
})


const poulateCandleForIntervalAbbrev = (interval, abbrev, conn) => 
  new Promise(async (resolve, reject) => 
{
  // console.log('populate candle for intervsl abbrev ... ' + abbrev)

  let candle
  try {
    candle = await fetchCandleHttp(5, abbrev)
  } catch (e) { 
    /* If failed to fetch candle. Try again in 5 seconds */
    await forceWait(5)

    try {
      candle = await fetchCandleHttp(interval, abbrev)
    } catch (e) {
      return reject(e)
    }
  }

  try {
    await insertCandle(interval, abbrev, candle, conn)
  } catch (e) {
    return reject(e)
  }

  try {
    await storeCache(interval, abbrev, candle)
  } catch (e) {
    return reject(e)
  }

  resolve()
})


const forceWait = (secs) => new Promise(resolve => setTimeout(resolve, secs * 1000))
