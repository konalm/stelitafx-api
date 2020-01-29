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

const protoNo = 51

const openConditions = [
  'fiveWMACrossedOverFifteenWMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'fiveWMACroseedUnderFifteenWMA'
]

const transactionType = 'long'
