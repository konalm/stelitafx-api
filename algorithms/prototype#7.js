const service = require('./service');
const prototypeFramework = require('./prototypeFramework');

module.exports = () =>
  prototypeFramework(7, conditionData, openConditionsMet, closeConditionsMet);

/**
 * Retrieve data required to determine open and close conditions met
 *
 * 1. Current and previous WMA
 */
const conditionData = async (abbrev) => {
  let WMAs
  try {
    WMAs = await service.getCurrentAndPrevWMAs(abbrev);
  } catch(err) {}
  const currentRate = WMAs.WMA.rate;

  return {
    currentRate,
    WMAs
  }
}

/**
 * Open trade if following conditions met;
 *
 * 1. Short WMA crossed under the long WMA
 */
const openConditionsMet = async (data) => {
  console.log('prototype#7 open condiitons met')
  console.log(data)
  console.log('<<<<<<<<<<,')

  if (service.shortWMACrossedUnder(data.WMAs, 12, 36)) {
    console.log('short WMA crossed under');
    if (service.currentRateUnderShortWMA(data.currentRate, data.WMAs, 12)) {
      console.log('current rate under short WMA')
      return true;
    } else {
      console.log('current date was over')
    }
  } else {
    console.log('short WMA did not cross under')
  }
}


/**
 * Close trade if following conditions met;
 *
 * 1. Short WMA crossed over the long WMA
 */
const closeConditionsMet = async (data) => {
  return service.shortWMACrossedOver(data.WMAs, 12, 36);
}
