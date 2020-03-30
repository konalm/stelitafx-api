const { calcStochastic } = require('@/stochastic/service');


module.exports = (rates, index) => {
  const length = 16 

  if (index < 16) return null

  const relevantRates =  [...rates].splice(index - length, length)

  return calcStochastic(relevantRates)
}