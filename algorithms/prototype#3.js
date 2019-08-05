const service = require('./service');
const prototypeFramework = require('./prototypeFramework');
const calculatePip = require('../services/calculatePip');
const currencyRateRepo = require('../currencyRates/repository');
const tradeRepo = require('../trade/repository');


module.exports = () => prototypeFramework(
  3,
  conditionData,
  openConditionsMet,
  closeConditionsMet
);


/**
 * Retrieve data required to determine open and close conditions met
 *
 * 1. Current and previous WMA
 * 2. Pip movement since opening trade
 */
const conditionData = async (abbrev) => {
  let WMAs;
  try {
    WMAs = await service.getCurrentAndPrevWMAs(abbrev, 3);
  } catch (err) {
    throw new Error(`could not get current and prev WMAs: ${err}`);
  }
  const currencyRate = WMAs.WMA.rate;

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

  return {
    WMAs,
    pip
  }
}


/**
 * Open trade if following conditions met;
 *
 * 1. Short WMA crossed over the long WMA
 */
const openConditionsMet = async (data) => {
  return service.shortWMACrossedOver(data.WMAs, 12, 36);
}

/**
 * Close trade if following conditions met;
 *
 * 1. Pip moves up by 1
 * 2. Short WMA crossed under the long WMA
 */
const closeConditionsMet = async (data) => {
  if (data.pip >= 1) return true;

  const shortWMACrossedUnder = service.shortWMACrossedUnder(data.WMAs, 12, 36);
  if (shortWMACrossedUnder) return true;
}
