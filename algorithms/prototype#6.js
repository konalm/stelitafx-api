const service = require('./service');
const prototypeFramework = require('./prototypeFramework');
const tradeRepo = require('../trade/repository');
const calculatePip = require('../services/calculatePip');


module.exports = () =>
  prototypeFramework(6, conditionData, openConditionsMet, closeConditionsMet);

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
  const currencyRate = WMAs.WMA.rate;

  let openingTrade;
  try {
    openingTrade = await tradeRepo.getLastTrade(6, abbrev);
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
  return service.shortWMACrossedOver(data.WMAs, 5, 12);
}


/**
 * Close trade if following conditions met;
 *
 * 1. Short WMA crossed under the long WMA
 */
const closeConditionsMet = async (data) => {
  if (data.pip >= 1) return true;
  
  return service.shortWMACrossedOver(data.WMAs, 5, 12);
}
