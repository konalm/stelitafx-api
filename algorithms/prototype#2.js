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

const protoNo = 2

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'pipDecreasedByOne'
]

const transactionType = 'long'
