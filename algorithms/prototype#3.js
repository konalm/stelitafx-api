const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval) =>
  prototypeFramework(protoNo, openConditions, closeConditions, timeInterval);

const protoNo = 3

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'twelveWMACrossedUnder36WMA'
]