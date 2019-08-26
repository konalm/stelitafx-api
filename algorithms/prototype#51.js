const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = () =>
  prototypeFramework(protoNo, openConditions, closeConditions);

const protoNo = 51

const openConditions = [
  'fiveWMACrossedOverFifteenWMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'fiveWMACroseedUnderFifteenWMA'
]