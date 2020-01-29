const prototypeFramework = require('./prototypeFrameworkV2');
const protoNo = 92
const openConditions = [
  'twelveWMACrossedOver36WMA'
]
const closeConditions = [
  'twelveWMACrossedUnder36WMA'
]
const transactionType = 'short'


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
      // console.log('prototype 1 complete !!!')
      resolve()
    })
    .catch(e => {
      console.error(`ERROR: ${e}`)
      resolve()
    })
})

