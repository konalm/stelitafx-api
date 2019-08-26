const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = () =>
  prototypeFramework(protoNo, openConditions, closeConditions);

const protoNo = 73

const openConditions = [
  'twelveWMACrossedUnder36WMA',
  'currentRateUnderTwelveWMA'
];

 const closeConditions = [
    'twelveWMAOverOver36WMA',
    'thirtyMinsSinceTrade'
 ]