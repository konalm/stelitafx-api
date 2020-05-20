const { CURRENCYPAIRS } = require('@/config')
const getCachedRates = require('./getCachedRates')
const symbolToAbbrev = require('@/services/symbolToAbbrev')

module.exports = () => new Promise(async (resolve, reject) => {
  const rates = {}
  for (i in CURRENCYPAIRS) {
    const currencyPair = CURRENCYPAIRS[i]
  
    const abbrev = symbolToAbbrev(currencyPair)
    rates[currencyPair] = await getCachedRates(1, abbrev, 1)
  }

  resolve(rates)
})