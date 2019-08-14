const service = require('./service');
const prototypeFramework = require('./prototypeFramework');


module.exports = () =>
  prototypeFramework(1, conditionData, openConditionsMet, closeConditionsMet);

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

  return {
    WMAs
  }
}

/**
 * Open trade if following conditions met;
 *
 * 1. Short WMA crossed over the long WMA
 */
const openConditionsMet = async (data) => {
  // console.log('prototype #1 >> open conditions met')
  // console.log(data)

  return service.shortWMACrossedOver(data.WMAs, 12, 36);
}


/**
 * Close trade if following conditions met;
 *
 * 1. Short WMA crossed under the long WMA
 */
const closeConditionsMet = async (data) => {
  return service.shortWMACrossedUnder(data.WMAs, 12, 36);
}
