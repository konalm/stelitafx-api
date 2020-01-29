const prototypeFramework = require('./prototypeFrameworkV2');

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
  
const protoNo = 85

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'twelveWMACrossedOver36WMA',
  'currentRateUnderNineMovingAverage'
]

const transactionType = 'long'

