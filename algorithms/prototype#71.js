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
  
const protoNo = 71

const openConditions = [
  'twelveWMACrossedUnder36WMA'
]

const closeConditions = [
  'twelveWMACrossedOver36WMA',
  'pipDecreasedByEight'
]
