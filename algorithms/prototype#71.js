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
  
const protoNo = 71

const openConditions = [
  'twelveWMACrossedUnder36WMA'
]

const closeConditions = [
  'twelveWMACrossedOver36WMA',
  'pipDecreasedByEight'
]

const transactionType = 'long'
