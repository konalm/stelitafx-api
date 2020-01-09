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
  
const protoNo = 87

const openConditions = [
  'stochasticBelowTwenty',
  'prevStochasticBelowTwenty',
  'stochasticIncreased'
]

const closeConditions = [
  'stochasticOverEighty',
  'prevStochasticAboveTwentyCurrentBelow'
]
