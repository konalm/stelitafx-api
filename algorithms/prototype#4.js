const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval, currencyRateSource) =>
  prototypeFramework(
    protoNo,
    openConditions,
    closeConditions,
    timeInterval,
    currencyRateSource
  );

const protoNo = 4

const openConditions = [
  'fiveWMACrossedOverTwelveWMA'
]

const closeConditions = [
  'fiveWMACrossedUnderTwelveWMA'
]