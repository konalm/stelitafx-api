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


const protoNo = 104

const openConditions = [
  'macdOverLag',
  'macdHistogramAbovePointFifteen'
]
  
const closeConditions = [
  'macdUnderLag'
]
  
const transactionType = 'long'