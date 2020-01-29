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
  
const protoNo = 86

const openConditions = [
  'stochasticBelowTwenty',
  'prevStochasticBelowTwenty',
  'stochasticIncreased'
]

const closeConditions = [
  'stochasticOverEighty',
]

const transactionType = 'long'
