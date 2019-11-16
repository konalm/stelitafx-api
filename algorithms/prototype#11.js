const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval, currencyRateSource) =>
  prototypeFramework(
    protoNo, 
    openConditions, 
    closeConditions, 
    timeInterval, 
    currencyRateSource
  );

const protoNo = 11

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'currentRateUnderTwelveWMA'
]