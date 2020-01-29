const fs = require('fs');
const config = require('../config');
const DIR = 'cache/currencyRate'

module.exports = (date, rates) => new Promise(async (resolve, reject) => {
  console.log(`CACHE RATE @ ... ${date}`)

  const min = date.getMinutes()
  const intervalsToCacheRate = []
  config.TIME_INTERVALS.forEach((interval) => {
    if (min % interval === 0) intervalsToCacheRate.push(interval)
  })

  const intervalRatesCachePromises = []
  intervalsToCacheRate.forEach((interval) => {
    intervalRatesCachePromises.push(cacheIntervalRates(interval, rates, date))
  })

  Promise.all(intervalRatesCachePromises)
    .then(() => {
      console.log('RATES CACHED FOR ALL INTERVALS')
      resolve()
    })
    .catch(e => {
      console.log('Failed :( ')
      console.log(e)
      reject()
    })
})


const cacheIntervalRates = (interval, rates, date) =>  new Promise(async (resolve, reject) => {
  console.log(`cache interval .. ${interval}`)
  console.log(rates)

  /* create dir for interval if it does not exist */
  const intervalDir = `${DIR}/${interval}`
  if (!fs.existsSync(intervalDir)) await fs.mkdirSync(intervalDir)


  const cacheAbbrevRatePromises = []
  rates.forEach((rate) => {
    cacheAbbrevRatePromises.push(cacheIntervalAbbrevRate(interval, rate, date))
  })

  Promise.all(cacheAbbrevRatePromises)
    .then(res => {
      console.log('cached all abbrev rates')
      resolve()
    })
    .catch(e => {
      console.log('Failed to cache abbrev rates for interval')
    })

 
  // check length of array. Pop id exceeds 500 
})


const cacheIntervalAbbrevRate = (interval, rate, date) => 
  new Promise(async(resolve, reject) => 
{
  const abbrev = `${rate.currency}USD`
  const filename = `${DIR}/${interval}/${abbrev}.JSON`

  let currencyRates
  try {
    currencyRates = JSON.parse(await fs.readFileSync(filename, 'utf8'))
  } catch (e) {
    console.error(`Failed to read currency rates from: ${filename}`)
  }

  if (!currencyRates) currencyRates = []

  currencyRates.push({
    date,
    bid: rate.bid,
    ask: rate.ask
  })

  // console.log(`currency rates length ... ${currencyRates.length}`)
  
  try {
    await fs.writeFileSync(filename, JSON.stringify(currencyRates))
  } catch (e) {
    return reject(`Failed to write ${rate} to cache`)
  }

  resolve()
})