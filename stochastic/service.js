const { GetCurrencyLatestRates } = require('../currencyRates/repository')
const repo = require('./repository')
const { MAJOR_CURRENCIES } = require('../config');
const dbConnections = require('../dbConnections')
const db = require('../dbInstance');
const getCurrencyRates = require('../currencyRates/services/getCurrencyRates')


exports.calculateStochastic = async (abbrev, timeInterval, conn) => {
  console.log('calculate stochastic')

  let latestRates;
  try {
    latestRates = await getCurrencyRates(timeInterval, abbrev, 16)
  } catch (e) {
    console.log(e)
    throw new Error(`Failed to get last 14 rates: ${e}`)
  }

  console.log('currency rates >>')
  console.log(latestRates)
  

  /* calculate last 3 stochastics */ 
  const fastStochastics = [] 
  for (let i = 2; i >= 0; i--) {
    const rates = latestRates.slice(i, i + 14)
    const highestRate = Math.max.apply(Math, rates.map((rate) => rate.exchange_rate))
    const lowestRate = Math.min.apply(Math, rates.map((rate) => rate.exchange_rate))
    const latestRate = rates[0].exchange_rate
    const stochastic = (latestRate - lowestRate) / (highestRate - lowestRate) * 100
    fastStochastics.push(stochastic)
  }

  const slowStochastic = fastStochastics.reduce((acc, x) => acc + x) / fastStochastics.length
  if (isNaN(slowStochastic)) return 0
  
  return slowStochastic 
}


exports.calcStochastic = (_rates) => {
   /* calculate last 3 stochastics */ 
   const fastStochastics = [] 
   for (let i = 2; i >= 0; i--) {
     const rates = _rates.slice(i, i + 14)
     const highestRate = Math.max.apply(Math, rates.map((rate) => rate.exchange_rate))
     const lowestRate = Math.min.apply(Math, rates.map((rate) => rate.exchange_rate))
     const latestRate = rates[0].exchange_rate
     const stochastic = (latestRate - lowestRate) / (highestRate - lowestRate) * 100
     fastStochastics.push(stochastic)
   }
 
   const slowStochastic = fastStochastics.reduce((acc, x) => acc + x) / fastStochastics.length
   if (isNaN(slowStochastic)) return 0
   
   return slowStochastic 
}


exports.storeStochastic = (timeInterval) => new Promise(async (resolve, reject) => {
  const storeStochasticPromises = []
  const conn = db()

  MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/USD`
    storeStochasticPromises.push(storeStochasticForCurrency(abbrev, timeInterval, conn))
  })

  try {
    await Promise.all(storeStochasticPromises)
  } catch (e) {
    console.log('failed to store stochastics')
    console.log(e)
    return reject(`Failed to store stochastic currencies`)
  }

  resolve()
})


const storeStochasticForCurrency = (abbrev, timeInterval, conn) => 
  new Promise(async (resolve, _) => 
{

  let stochastic
  try {
    stochastic = await this.calculateStochastic(abbrev, timeInterval, conn)
  } catch (e) {
    console.log('Failed to calculate stochastic')
    console.log(e)
    throw new Error(`Failed to get stochastic: ${e}`)
  }

  repo.saveStochastic(abbrev, timeInterval, stochastic, conn)
    .then(() => {
      resolve()
    })
    .catch((e) => {
      console.error(e)
      resolve()
    })
})