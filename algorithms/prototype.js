const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval) =>
  prototypeFramework(protoNo, openConditions, closeConditions, timeInterval);

const protoNo = 1

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'twelveWMACrossedUnder36WMA'
]