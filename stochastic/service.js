const { GetCurrencyLatestRates } = require('../currencyRates/repository')
const repo = require('./repository')
const { MAJOR_CURRENCIES } = require('../config');

exports.calculateStochastic = async (abbrev, timeInterval) => {
  let last14Rates;
  try {
    last14Rates = await GetCurrencyLatestRates(abbrev, 14, 0, timeInterval, 'currency_rate')
  } catch (e) {
    console.log('failed to get last 14 rates ??')
    throw new Error(`Failed to get last 14 rates: ${e}`)
  }

  const highestRate = Math.max.apply(Math, last14Rates.map((rate) => rate.exchange_rate))
  const lowestRate = Math.min.apply(Math, last14Rates.map((rate) => rate.exchange_rate))
  const latestRate = last14Rates[0].exchange_rate

  const stochastic = (latestRate - lowestRate) / (highestRate - lowestRate) * 100
  if (isNaN(stochastic)) return 0
  
  return stochastic 
}

exports.storeStochastic = (timeInterval) => new Promise(async (resolve, reject) => {
  console.log(`store stochastic for ... ${timeInterval}`)

  const storeStochasticPromises = []
  console.log('stochastic for currency promises ??')
  MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/USD`
    storeStochasticPromises.push(storeStochasticForCurrency(abbrev, timeInterval))
  })

  try {
    await Promise.all(storeStochasticPromises)
  } catch (e) {
    return reject(`Failed to store stochastic currencies`)
  }

  resolve()
})

const storeStochasticForCurrency = (abbrev, timeInterval) => new Promise(async (resolve, reject) => {
  let stochastic
  try {
    stochastic = await this.calculateStochastic(abbrev, timeInterval)
  } catch (e) {
    throw new Error(`Failed to get stochastic: ${e}`)
  }

  repo.saveStochastic(abbrev, timeInterval, stochastic)
    .then(() => {
      resolve()
    })
    .catch((e) => {
      resolve()
    })
})