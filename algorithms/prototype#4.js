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

const protoNo = 4

const openConditions = [
  'fiveWMACrossedOverTwelveWMA'
]

const closeConditions = [
  'fiveWMACrossedUnderTwelveWMA'
]

const transactionType = 'long'
