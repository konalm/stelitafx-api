const prototypeFramework = require('./prototypeFrameworkV2');
const protoNo = 14
const openConditions = [
  'stochasticBelowTwenty'
]
const closeConditions = [
  'stochasticOverEighty'
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

