const service = require('./service');
const tradeRepo = require('../trade/repository');

/**
 * Condition return for passed indicators being triggered 
 */
exports.indicatorsTriggered = (data, prototypeIndicators) => {
  const abbrevIndicators = indicators(data);

  const allConditionsMet = !prototypeIndicators.some((condition) => 
    abbrevIndicators[condition] === false
  )

  return allConditionsMet;
}



/**
 * All indicators that can trigger an action on a trade 
 */
const indicators = (data) => {
  return {
    twelveWMACrossedOver36WMA: service.shortWMACrossedOver(data.WMAs, 12, 36),
    twelveWMACrossedUnder36WMA: service.shortWMACrossedUnder(data.WMAs, 12, 36),
    pipIncreasedByOne: data.pip >= 1,
    pipDecreasedByOne: data.pip <= 1,
    fiveWMACrossedOverTwelveWMA: service.shortWMACrossedOver(data.WMAs, 5, 12),
    fiveWMACrossedUnderTwelveWMA: service.shortWMACrossedUnder(data.WMAs, 5, 12),
    currentRateUnderTwelveWMA: service.currentRateUnderShortWMA(data.currentRate, data.WMAs, 12),
    pipDecreasedByEight: data.pip <= 8,
    pipDecreasedByTwelve: data.pip <= 12,
    ThirtyMinsSinceTrade: data.openingTrade 
      ? service.minsSinceOpeningTrade(data.openingTrade.openDate) >= 30
      : 0,
    fortyFiveMinsSinceTrade: data.openingTrade
      ? service.minsSinceOpeningTrade(data.openingTrade.openDate) >= 45
      : 0
  }
}



/**
 * Weighted moving averages
 * Current rate of abbrev
 * opening trade
 * abbrev rate when trade was opened
 */
exports.dataForIndicators = async (protoNo, abbrev) => {
  try {
    const WMAs = await service.getCurrentAndPrevWMAs(abbrev)
    const currentRate = WMAs.WMA
      ? WMAs.WMA.rate
      : null
    
    let openingTrade 
    try  {
      openingTrade = await tradeRepo.getLastTrade(protoNo, abbrev)
    } catch (err) {
      console.error(err)
    }
    const openingRate = openingTrade && !openingTrade.closed
      ? openingTrade.openRate
      : null
    const pip = openingTrade && currentRate
      ? calculatePip(openingRate, currentRate, abbrev)
      : 0

    return {
      WMAs,
      currentRate,
      openingTrade,
      pip
    }
  }
  catch (e) { throw Error(`data for indicators ${e}`) }
}


