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

const protoNo = 73

const openConditions = [
  'twelveWMACrossedUnder36WMA',
  'currentRateUnderTwelveWMA'
];

 const closeConditions = [
  'twelveWMACrossedOver36WMA',
  'thirtyMinsSinceTrade'
 ]

 const transactionType = 'long'
