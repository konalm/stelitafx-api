const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval) =>
  prototypeFramework(protoNo, openConditions, closeConditions, timeInterval);

const protoNo = 71

const openConditions = [
  'twelveWMACrossedUnder36WMA'
]

const closeConditions = [
  'twelveWMACrossedOver36WMA',
  'pipDecreasedByEight'
]
