const service = require('./service');
const prototypeFramework = require('./prototypeFramework');
const calculatePip = require('../services/calculatePip');
const tradeRepo = require('../trade/repository');

module.exports = () => prototypeFramework(
  2,
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
  let WMAs
  try {
    WMAs = await service.getCurrentAndPrevWMAs(abbrev);
  } catch(err) {}
  const currencyRate = WMAs.WMA.rate;

  let openingTrade;
  try {
    openingTrade = await tradeRepo.getLastTrade(2, abbrev);
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
 * 1. Pip moves up or down by 1
 */
const closeConditionsMet = async (data) => {
  return (data.pip <= -1 || data.pip >= 1)
}
