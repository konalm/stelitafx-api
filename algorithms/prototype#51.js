const prototypeFramework = require('./prototypeFrameworkV2');

module.exports = (timeInterval, currencyRateSource) =>
  prototypeFramework(
    protoNo,
    openConditions,
    closeConditions,
    timeInterval,
    currencyRateSource
  );
  
const protoNo = 51

const openConditions = [
  'fiveWMACrossedOverFifteenWMA'
]

const closeConditions = [
  'pipIncreasedByOne',
  'fiveWMACroseedUnderFifteenWMA'
]