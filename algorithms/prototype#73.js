const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval, currencyRateSource) =>
  prototypeFramework(
    protoNo,
    openConditions,
    closeConditions,
    timeInterval,
    currencyRateSource
  );

const protoNo = 73

const openConditions = [
  'twelveWMACrossedUnder36WMA',
  'currentRateUnderTwelveWMA'
];

 const closeConditions = [
    'twelveWMACrossedOver36WMA',
    'thirtyMinsSinceTrade'
 ]
