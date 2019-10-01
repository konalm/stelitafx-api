const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval) =>
  prototypeFramework(protoNo, openConditions, closeConditions, timeInterval);

const protoNo = 2

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'pipDecreasedByOne'
]