const prototypeFramework = require('./prototypeFrameworkV2');
const protoNo = 80
const openConditions = [
  'stochasticBelowTwenty'
]
const closeConditions = [
  'stochasticOverEighty'
]


module.exports = (timeInterval, currency, currencyRateSrc, intervalCurrencyData) => 
  new Promise((resolve, _) => 
{
  prototypeFramework(
    protoNo, 
    currency,
    openConditions, 
    closeConditions, 
    timeInterval, 
    currencyRateSrc,
    intervalCurrencyData
  )
    .then(() => {
      resolve()
    })
    .catch(e => {
      console.error(`ERROR: ${e}`)
      resolve()
    })
})

