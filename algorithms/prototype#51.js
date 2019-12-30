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
  
const protoNo = 51

const openConditions = [
  'fiveWMACrossedOverFifteenWMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'fiveWMACroseedUnderFifteenWMA'
]