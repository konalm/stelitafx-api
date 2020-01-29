const getCachedRates = require('./getCachedRates')
const currencyRatesRepo = require('../repository');


module.exports = (interval, abbrev, count) => new Promise(async (resolve, reject) => {
  /* first attempt to get currency rates from cache */
  let currencyRates
  try {
    currencyRates = await getCachedRates(interval, abbrev, count)
  } catch (e) {
    console.log('failed to get cached currency rate')
  }

  if (currencyRates) {
    currencyRates.forEach((x) => x.exchange_rate = x.bid )
    return resolve(currencyRates)
  }

  /* get currency rate from DB if cache fails */ 
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
      abbrev, 
      count, 
      0,  
      interval,
      null
    )
  } catch (e) {
    console.log(e)
    return reject('Failed to get currency rates from MYSQL')
  } 

  resolve(currencyRates)
})