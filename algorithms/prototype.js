const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval, currencyRateSource) =>
  prototypeFramework(
    protoNo, 
    openConditions, 
    closeConditions, 
    timeInterval, 
    currencyRateSource
  );

const protoNo = 1

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'twelveWMACrossedUnder36WMA'
]