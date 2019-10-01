const prototypeFramework = require('./prototypeFrameworkV3');

module.exports = (timeInterval) =>
  prototypeFramework(protoNo, openConditions, closeConditions, timeInterval);

const protoNo = 1

const openConditions = [
  shortWMACrossedOver(12,36)
]

const closeConditions = [
  shortWMACrossedUnder(12, 36)
]