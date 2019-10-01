const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval) =>
  prototypeFramework(protoNo, openConditions, closeConditions, timeInterval);

const protoNo = 73

const openConditions = [
  'twelveWMACrossedUnder36WMA',
  'currentRateUnderTwelveWMA'
];

 const closeConditions = [
    'twelveWMACrossedOver36WMA',
    'thirtyMinsSinceTrade'
 ]
