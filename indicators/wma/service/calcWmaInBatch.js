const { calcWeightedMovingAverage } = require('@/currencyRates/service')


module.exports = (rates, index, wmaLength) => {
  if (index < wmaLength - 1) return null

  const relevantRates =  [...rates].splice(index - wmaLength, wmaLength)

  return calcWeightedMovingAverage(relevantRates)
}