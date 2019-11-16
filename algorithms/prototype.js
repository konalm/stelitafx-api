const prototypeFramework = require('./prototypeFrameworkV2');
const protoNo = 1
const openConditions = [
  'twelveWMACrossedOver36WMA'
]
const closeConditions = [
  'twelveWMACrossedUnder36WMA'
]


module.exports = (timeInterval, currencyRateSource) => new Promise((resolve, _) => {
  prototypeFramework(
    protoNo, 
    openConditions, 
    closeConditions, 
    timeInterval, 
    currencyRateSource
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

