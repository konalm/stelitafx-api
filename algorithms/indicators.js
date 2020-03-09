const service = require('./service');
const tradeRepo = require('../trade/repository');
// const { getLatestStochastic } = require('../stochastic/repository')
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
    macdHistogramAbovePointFifteen: data.macd.current.macdHistogram >= 0.00015,
    macdCrossedOver: service.macdCrossedOver(data.macd.current, data.macd.prior),
    macdCrossedUnder: service.macdCrossedUnder(data.macd.current, data.macd.prior),
    macdUnderLag: service.macdUnderLag(data.macd.current),
    macdOverLag: !service.macdUnderLag(data.macd.current),
    macdHistogramDecreased: service.macdHistogramDecreased(data.macd.current, data.macd.prior),
    macdHistogramIncreased: service.macdHistogramIncreased(data.macd.current, data.macd.prior),
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
    stochasticBelowTwenty: data.stochastic.current <= 20,
    stochasticOverEighty: data.stochastic.current >= 80,
    prevStochasticBelowTwenty: data.stochastic.prev <= 20,
    stochasticIncreased: data.stochastic.current > data.stochastic.prev,
    currentRateUnderNineMovingAverage: service.currentRateUnderShortWMA(data.currentRate, data.WMAs, 9),
    prevStochasticAboveTwentyCurrentBelow: data.stochastic.prev >= 20 && data.stochastic.current < 20
  }
}


/**
 * Weighted moving averages
 * Current rate of abbrev
 * opening trade
 * abbrev rate when trade was opened
 */
exports.dataForIndicators = ( abbrev, intervalCurrencyData, openingTrade ) => {
  const s = new Date()
  const { movingAverages, WMAs, currentRate, stochastic, macd } = intervalCurrencyData

  // const openingTrade = lastTrades.find(x => x.prototypeNo === protoNo)

  const openingRate = openingTrade && !openingTrade.closed
    ? openingTrade.openRate
    : null
  
  const pip = openingTrade && currentRate
    ? calculatePip(openingRate, currentRate, abbrev)
    : 0

  return {
    movingAverages,
    WMAs,
    currentRate,
    openingTrade,
    pip,
    stochastic,
    macd
  }
}
