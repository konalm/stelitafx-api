const prototypeFramework = require('./prototypeFrameworkV2');
const protoNo = 1
const openConditions = [
  'twelveWMACrossedOver36WMA'
]
const closeConditions = [
  'twelveWMACrossedUnder36WMA'
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
      // console.log('prototype 1 complete !!!')
      resolve()
    })
    .catch(e => {
      console.error(`ERROR: ${e}`)
      resolve()
    })
})

