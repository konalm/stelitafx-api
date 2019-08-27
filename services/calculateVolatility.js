const currencyRateRepo = require('../currencyRates/repository')

module.exports = (abbrev, length = 10) => new Promise(async (resolve, reject) => {
  console.log('calculate volatility')

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
  const squaredDeviationSum = squaredDeviations.reduce((a, b) => a + b, 0)
  const squaredDeviationAverage = squaredDeviationSum / length
  const squareRootAverage = Math.pow(squaredDeviationAverage, 10)

  console.log(squareRootAverage)
  console.log(Math.round(squareRootAverage))
  console.log(parseFloat(squareRootAverage).toFixed(2))

})