const service = require('./service');
const tradeRepo = require('../trade/repository');
const { getLatestStochastic } = require('../stochastic/repository')
const calculatePip = require('../services/calculatePip');

/**
 * Condition return for passed indicators being triggered
 */
exports.indicatorsTriggered = (data, prototypeIndicators) => {
  const abbrevIndicators = this.indicators(data);

  const allConditionsMet = !prototypeIndicators.some((condition) =>
    abbrevIndicators[condition] === false
  )

  return allConditionsMet
}


/**
 *
 */
exports.anIndicatorTriggered = (data, prototypeIndicators) => {
  const abbrevIndicators = this.indicators(data);

  let conditionMet = false
  prototypeIndicators.forEach((indicator) => {
    if (abbrevIndicators[indicator]) {
      conditionMet = true
    }
  })

  return conditionMet
}


/**
 * All indicators that can trigger an action on a trade
 */
exports.indicators = (data) => {
  return {
    twelveWMACrossedOver36WMA: service.shortWMACrossedOver(data.WMAs, 12, 36),
    twelveWMACrossedUnder36WMA: service.shortWMACrossedUnder(data.WMAs, 12, 36),
    pipIncreasedByOne: data.pip >= 1,
    pipIncreasedByTen: data.pip >= 10,
    pipDecreasedByOne: data.pip <= 1,
    fiveWMACrossedOverTwelveWMA: service.shortWMACrossedOver(data.WMAs, 5, 12),
    fiveWMACrossedUnderTwelveWMA: service.shortWMACrossedUnder(data.WMAs, 5, 12),
    fiveWMACrossedOverFifteenWMA: service.shortWMACrossedOver(data.WMAs, 5, 15),
    fiveWMACroseedUnderFifteenWMA: service.shortWMACrossedUnder(data.WMAs, 5, 15),
    currentRateUnderTwelveWMA: service.currentRateUnderShortWMA(data.currentRate, data.WMAs, 12),
    currentRateOverTwoHundredWMA: service.currentRateAboveShortWMA(data.currentRate, data.WMAs, 200),
    currentRateOverOneHundredWMA: service.currentRateAboveShortWMA(data.currentRate, data.WMAs, 100),
    pipDecreasedByEight: data.pip <= -8,
    pipDecreasedByTwelve: data.pip <= -12,
    thirtyMinsSinceTrade: data.openingTrade
      ? service.minsSinceOpeningTrade(data.openingTrade.openDate) >= 30
      : 0,
    fortyFiveMinsSinceTrade: data.openingTrade
      ? service.minsSinceOpeningTrade(data.openingTrade.openDate) >= 45
      : 0,
    stochasticBelowTwenty: data.stochastic <= 20,
    stochasticOverEighty: data.stochastic >= 80
  }
}


/**
 * Weighted moving averages
 * Current rate of abbrev
 * opening trade
 * abbrev rate when trade was opened
 */
exports.dataForIndicators = async (
  protoNo, 
  abbrev, 
  timeInterval, 
  currencyRateSource
) => {
  const s = new Date()

  let WMAs
  try {
    WMAs = await service.getCurrentAndPrevWMAs(
      abbrev, 
      timeInterval, 
      currencyRateSource
    )
  } catch (e) {
    console.error(`Failed to get current and prev WMAs: ${e}`)
  }

  const currentRate = WMAs.WMA ? WMAs.WMA.rate : null

  let stochastic
  try {
    stochastic = await getLatestStochastic(abbrev, timeInterval)
  } catch (e) {
    console.error(`Failed to get latest stochastic: ${e}`)
  }

  let openingTrade
  try  {
    openingTrade = await tradeRepo.getLastTrade(
      protoNo, 
      timeInterval, 
      abbrev, 
      currencyRateSource
    )
  } catch (err) {
    console.error(err)
  }

  const openingRate = openingTrade && !openingTrade.closed
    ? openingTrade.openRate
    : null
  const pip = openingTrade && currentRate
    ? calculatePip(openingRate, currentRate, abbrev)
    : 0

    const e = new Date()
    const diff = e.getTime() - s.getTime()
    const secondsDiff = diff / 1000
    // console.log(`getting data for indicators took ${secondsDiff}`)

  return {
    WMAs,
    currentRate,
    openingTrade,
    pip,
    stochastic
  }
}
