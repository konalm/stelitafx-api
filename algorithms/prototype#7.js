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

const protoNo = 7

const openConditions = [
  'twelveWMACrossedUnder36WMA',
  'currentRateUnderTwelveWMA'
]

const closeConditions = [
  'twelveWMACrossedOver36WMA'
]