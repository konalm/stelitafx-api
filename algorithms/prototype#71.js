const service = require('./service');
const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = () => prototypeFramework(protoNo, openConditions, closeConditions);

const protoNo = 71

const openConditions = [
  'twelveWMACrossedOver36WMA'
]

const closeConditions = [
  'twelveWMACrossedUnder36WMA',
  'pipDecreasedByEight'
]


