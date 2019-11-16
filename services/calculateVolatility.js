const currencyRateRepo = require('../currencyRates/repository')

module.exports = (abbrev, length = 10) => new Promise(async (resolve, reject) => {
  let currencyRatesResponse;
  try {
    currencyRatesResponse = await currencyRateRepo.getCurrenciesRates(abbrev, length)
  } catch (err) {
    return reject(`Failed to get currency rates: ${err}`)
  }

  const currencyRates = currencyRatesResponse.map(x => x.exchange_rate)
  const sum = currencyRates.reduce((a, b) => a + b, 0)
  const average = sum / length

  const deviations = []
  currencyRates.forEach((rate) => 
    deviations.push(Math.abs(rate - average))
  )
  const squaredDeviations = deviations.map(x => Math.sqrt(x))

  const deviationSum = squaredDeviations.reduce((a, b) => a + b, 0)
  const variance = deviationSum / length
  const volatility = Math.sqrt(variance)

  resolve(volatility * 100)
})