const { calculateStochastic } = require('@/stochastic/service')

module.exports = (rates, index) => {
  const periodLength = 16
  const relevantRates = [...rates].splice(index - periodLength, index)

  return calculateStochastic(relevantRates)
}