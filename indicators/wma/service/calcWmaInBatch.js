const { calcWeightedMovingAverage } = require('@/currencyRates/service')


module.exports = (rates, index, wmaLength) => {
  if (index < wmaLength - 1) return null

  return calcWeightedMovingAverage(
    [...rates].splice(index - wmaLength + 1, wmaLength).reverse()
  )
}