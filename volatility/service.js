const { MAJOR_CURRENCIES } = require('../config');
const repo = require('./repository');
const db = require('../dbInstance');
const getCurrencyRates = require('../currencyRates/services/getCurrencyRates')


exports.storeVolatility = (interval) => new Promise(async(resolve, reject) => {
  const conn = db()
  
  const storeVolatilityCurrencies = []
  MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/USD`
    storeVolatilityCurrencies.push(storeVolatilityForCurrency(abbrev, interval, conn))
  })

  try {
    await Promise.all(storeVolatilityCurrencies)
  } catch (e) {
    console.log(e)
    return reject('Failed to store volatility for currencies')
  }

  conn.end()

  resolve()
})


const storeVolatilityForCurrency = (abbrev, interval, conn) => 
  new Promise(async (resolve, reject) => 
{
  let volatility
  try {
    volatility = await calculateVolatility(interval, abbrev)
  } catch (e) {
    console.log(e)
    return reject(`Failed to calculate volatility for ${interval}, ${abbrev}`)
  }

  repo.storeVolatility(conn, interval, abbrev, volatility)
    .then(() => {
      resolve()
    })
    .catch((e) => {
      console.log(e)
      resolve()
    })
})


const calculateVolatility = async (interval, abbrev) => {
  const length = 10

  let currencyRates
  try {
    currencyRates = await getCurrencyRates(interval, abbrev, length, false)
  } catch (e) {
    throw new Error(`Failed to get last 10 rates for volatility`)
  }

  const rates = currencyRates.map(x => x.exchange_rate)
  const sum = rates.reduce((a, b) => a + b, 0)
  const average = sum / length

  const deviations = []
  rates.forEach((rate) => deviations.push(Math.abs(rate - average)) )
  const squaredDeviations = deviations.map(x => Math.sqrt(x))

  const deviationSum = squaredDeviations.reduce((a, b) => a + b, 0)
  const variance = deviationSum / length
  const volatility = Math.sqrt(variance)

  return volatility * 100
}