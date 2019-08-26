const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = () => prototypeFramework(protoNo, openConditions, closeConditions);

const protoNo = 72

const openConditions = [
  'twelveWMACrossedUnder36WMA',
  'currentRateUnderTwelveWMA'
];

const closeConditions = [
  'twelveWMACrossedOver36WMA',
  'pipDecreasedByTwelve' 
];
