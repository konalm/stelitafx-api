const prototypeFramework = require('./prototypeFrameworkV2');
const protoNo = 14
const openConditions = [
  'stochasticBelowTwenty'
]
const closeConditions = [
  'stochasticOverEighty'
]

const transactionType = 'long'


module.exports = (timeInterval, currency, intervalCurrencyData, conn) => 
  new Promise((resolve, _) => 
{
  prototypeFramework(
    protoNo, 
    currency,
    openConditions, 
    closeConditions, 
    timeInterval, 
    intervalCurrencyData,
    conn,
    transactionType
  )
    .then(() => {
      resolve()
    })
    .catch(e => {
      console.error(`ERROR: ${e}`)
      resolve()
    })
})

