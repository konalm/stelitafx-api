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

const protoNo = 95

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'currentRateUnderTwelveWMA'
]

const transactionType = 'long'
