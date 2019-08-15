const config = require('../config');
const quoteCurrency = config.QUOTE_CURRENCY;
const wmaRepo = require('../wma/repository')
const tradeRepo = require('../trade/repository');


/**
 *
 */
exports.getCurrentAndPrevWMAs = async (abbrev) => {
  let wmaDataPoints;
  try {
    wmaDataPoints = await wmaRepo.getWMAs(abbrev, 2);
  } catch (err) {
    throw new Error('could not get WMAs:' + err);
  }

  const WMA = wmaDataPoints[0];
  const prevWMA = wmaDataPoints.length > 1 ? wmaDataPoints[1] : null;

  return {WMA, prevWMA};
}

/**
 * Current rate below the short WMA ??
 */
exports.currentRateUnderShortWMA = (currentRate, WMAs, shortLength) => {
  const WMA = WMAs.WMA.WMAs;

  return currentRate < WMA[shortLength];
}

/**
 *
 */
exports.currentRateAboveShortWMA = (currentRate, WMAs, shortLength) => {
  const WMA = WMAs.WMA.WMAs;

  return currentRate > WMA[shortLength];
}


/**
 * Short WMA moved above the long WMA
 */
exports.shortWMACrossedOver = (WMAs, shortLength, longLength) => {
  const WMA = WMAs.WMA.WMAs;
  const prevWMA = WMAs.prevWMA.WMAs;

  if (!prevWMA) return false;

  return (
    (WMA[shortLength] >= WMA[longLength])
    && (prevWMA[shortLength] < prevWMA[longLength])
  );
}


/**
 * Short WMA moved below the long WMA
 */
exports.shortWMACrossedUnder = (WMAs, shortLength, longLength) => {
  const WMA = WMAs.WMA.WMAs;
  const prevWMA = WMAs.prevWMA.WMAs;

  if (!prevWMA) return;

  return (
    (WMA[shortLength] <= WMA[longLength])
    && (prevWMA[shortLength] > prevWMA[longLength])
  );
}


/**
 *
 */
exports.getOpeningTrade = async (protoNo, currencyPairAbbrev) => {
  let lastTrade;
  try {
    lastTrade = await tradeRepo.getLastTrade(protoNo, currencyPairAbbrev);
  } catch (err) {
    throw new Error('error getting last trade: ' + err);
  }

  /* only return if last trade was an opening trade */
  if (!lastTrade || lastTrade.transaction === 'sell') return;

  return lastTrade;
}
