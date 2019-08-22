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

  let openingTrade;
  try {
    openingTrade = await tradeRepo.getLastTrade(3, abbrev);
  } catch (err) {
    throw new Error(`Failed to get last trade: ${err}`)
  }

  let openTradeRate = null
  if (openingTrade && !openingTrade.closed) openTradeRate = openingTrade.openRate

  let pip = 0;
  if (openTradeRate && currencyRate) pip = calculatePip(openTradeRate, currencyRate, abbrev);

  /* Get date since open date */ 

  return {
    currentRate,
    WMAs,
    pip
  }
}

/**
 * Open trade if following conditions met;
 *
 * 1. Short WMA crossed under the long WMA
 */
const openConditionsMet = async (data) => {
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
  // if (data.pip <= 12) return true;

  return service.shortWMACrossedOver(data.WMAs, 12, 36);
}
