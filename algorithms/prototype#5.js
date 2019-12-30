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

const protoNo = 5

const openConditions = [
  'fiveWMACrossedOverFifteenWMA'
]

const closeConditions = [
  'fiveWMACroseedUnderFifteenWMA'
]