const prototypeFramework = require('./prototypeFrameworkV2')

module.exports = (timeInterval, currency, intervalCurrencyData, conn) =>
  prototypeFramework(
    protoNo, 
    currency,
    openConditions, 
    closeConditions, 
    timeInterval, 
    intervalCurrencyData,
    conn,
    transactionType
  );


const protoNo = 102

const openConditions = [
  'macdCrossedOver'
]
  
const closeConditions = [
  'macdHistogramDecreased'
]
  
const transactionType = 'long'