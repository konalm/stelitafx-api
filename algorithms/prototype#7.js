const service = require('./service');
const prototypeFramework = require('./prototypeFramework');

module.exports = (timeInterval) => prototypeFramework(
  7,
  conditionData,
  openConditionsMet,
  closeConditionsMet,
  timeInterval
);

/**
 * Retrieve data required to determine open and close conditions met
 *
 * 1. Current and previous WMA
 */
const conditionData = async (abbrev, timeInterval) => {
  let WMAs
  try {
    WMAs = await service.getCurrentAndPrevWMAs(abbrev, timeInterval);
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
  if (service.shortWMACrossedUnder(data.WMAs, 12, 36)) {
    if (service.currentRateUnderShortWMA(data.currentRate, data.WMAs, 12)) {
      return true;
    }
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
