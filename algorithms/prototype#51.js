const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval) =>
  prototypeFramework(protoNo, openConditions, closeConditions, timeInterval);

const protoNo = 51

const openConditions = [
  'fiveWMACrossedOverFifteenWMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'fiveWMACroseedUnderFifteenWMA'
]