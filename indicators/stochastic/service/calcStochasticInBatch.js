const { calcStochastic } = require('@/stochastic/service');


module.exports = (rates, index) => {
  const length = 16 

  if (index < length - 1) return null

  return calcStochastic( [...rates].splice(index - length + 1, length).reverse() )
}