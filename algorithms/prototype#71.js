const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = () => prototypeFramework(protoNo, openConditions, closeConditions);

const protoNo = 71

const openConditions = [
  'twelveWMACrossedUnder36WMA'
]

const closeConditions = [
  'twelveWMACrossedOver36WMA',
  'pipDecreasedByEight'
]


