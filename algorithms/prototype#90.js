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

const protoNo = 90

const openConditions = [
  'fiveWMACrossedOverFifteenWMA'
]

const closeConditions = [
  'fiveWMACroseedUnderFifteenWMA'
]

const transactionType = 'short'
