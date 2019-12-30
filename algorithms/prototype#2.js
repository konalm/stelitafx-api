const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval, currency, currencyRateSrc, intervalCurrencyData) =>
  prototypeFramework(
    protoNo, 
    currency,
    openConditions, 
    closeConditions, 
    timeInterval, 
    currencyRateSrc,
    intervalCurrencyData
  );

const protoNo = 2

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'pipDecreasedByOne'
]