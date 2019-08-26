const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = () => prototypeFramework(protoNo, openConditions, closeConditions);

const protoNo = 74

const openConditions = [
  'twelveWMACrossedUnder36WMA',
  'currentRateUnderTwelveWMA'
];

const closeConditions = [
  'twelveWMAOverOver36WMA',
  'fortyFiveMinsSinceTrade'
]