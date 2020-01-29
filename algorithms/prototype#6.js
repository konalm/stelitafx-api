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

const protoNo = 6

const openConditions = [
  'fiveWMACrossedOverTwelveWMA'
]

const closeConditions = [
  'fiveWMACrossedUnderTwelveWMA',
  'pipIncreasedByOne'
]

const transactionType = 'long'
