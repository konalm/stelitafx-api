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

const transactionType = 'long'