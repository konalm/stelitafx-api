const config = require('../config');
const wmaRepo = require('../wma/repository')
const movingAverageRepo = require('../movingAverage/repository')
const tradeRepo = require('../trade/repository');
const calculatePip = require('../services/calculatePip')
const calculateVolatility = require('../services/calculateVolatility')
const dbConnections = require('../dbConnections')
const stochasticsRepo = require('../stochastic/repository')
const secsFromDate = require('../services/secondsBetweenDates')
const getCachedWMA = require('../wma/services/getCachedWMA')

exports.getCurrentAndPrevWMAs = async (
  abbrev, 
  timeInterval = 1, 
  currencyRateSource = ''
) => {
  // console.log('get current and prev WMA')

  const s = new Date() 

  // TODO .. attempt to get from cache!
  let cachedWMAs
  try {
    cachedWMAs = await getCachedWMA(timeInterval, abbrev, 2)
  } catch (e) {
    console.error('Failed to get cached WMAs')
  }

  if (cachedWMAs) {
    const WMA = cachedWMAs[0];
    const prevWMA = cachedWMAs.length > 1 ? cachedWMAs[1] : null;

    return {WMA, prevWMA}
  }

  let wmaDataPoints;
  try {
    wmaDataPoints = await wmaRepo.getWMAs(abbrev, timeInterval, 2, 0, currencyRateSource)
  } catch (err) {
    throw new Error('could not get WMAs:' + err);
  }

  const WMA = wmaDataPoints[0];
  const prevWMA = wmaDataPoints.length > 1 ? wmaDataPoints[1] : null;

  return {WMA, prevWMA};
}

exports.getCurrentAndPrevStochastic = async (abbrev, interval) => {
  const s = new Date()

  let stochastics
  try {
    stochastics = await stochasticsRepo.getStochastics(abbrev, interval, 2, 0)
  } catch (e) {
    throw new Error(`Could not get stochastics: ${e}`)
  }

  // console.log(`time taken to get current and prev stochastic ... ${ secsFromDate(s) }`)

  return { current: stochastics[0].stochastic, prev: stochastics[1].stochastic }
}

exports.getMovingAverages = async (
  abbrev, 
  interval, 
  currencyRateSrc = 'currency_rate'
) => {
  const s = new Date()

  let movingAverageDataPoints
  try {
    movingAverageDataPoints = await movingAverageRepo.getMovingAverages(
      abbrev,
      interval,
      1,
      0,
      currencyRateSrc
    )
  } catch (e) {
    throw new Error('Could not get moving averages: ' + e)
  }

  // console.log(`time taken to get moving averages .. ${secsFromDate(s) }`)

  return movingAverageDataPoints[0]
}


exports.currentRateUnderShortWMA = (currentRate, WMAs, shortLength) => {
  const WMA = WMAs.WMA.WMAs;

  return currentRate < WMA[shortLength];
}


exports.currentRateAboveShortWMA = (currentRate, WMAs, shortLength) => {
  const WMA = WMAs.WMA.WMAs;

  return currentRate > WMA[shortLength];
}


exports.shortWMACrossedOver = (WMAs, shortLength, longLength) => {
  const WMA = WMAs.WMA.WMAs;
  const prevWMA = WMAs.prevWMA.WMAs;

  if (!prevWMA) return false;

  return (
    (WMA[shortLength] >= WMA[longLength])
    && (prevWMA[shortLength] < prevWMA[longLength])
  );
}

exports.shortWMACrossedUnder = (WMAs, shortLength, longLength) => {
  const WMA = WMAs.WMA.WMAs;
  const prevWMA = WMAs.prevWMA.WMAs;

  if (!prevWMA) return;

  return (
    (WMA[shortLength] <= WMA[longLength])
    && (prevWMA[shortLength] > prevWMA[longLength])
  );
}

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

exports.minsSinceOpeningTrade = (openingDate) => {
  const openDate = new Date(openingDate)
  const currentDate = new Date()

  const diffMs = (currentDate - openDate);
  const mins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

  const hours = (Math.abs(currentDate - openDate) / 36e5).toFixed(0)
  const hoursToMins = parseInt(hours) * 60;

  return hoursToMins + mins
}

exports.stats = async (data, abbrev) => {
  const currentRate = data.currentRate
  const fiveWMA = data.WMAs.WMA['5']
  const twelveWMA = data.WMAs.WMA['12']
  const thirtySixWMA = data.WMAs.WMA['36']

  const currentRate5WMADistance = calculatePip(currentRate, fiveWMA);
  const currentRate12WMADistance = calculatePip(currentRate, twelveWMA);
  const currentRate36WMADistance = calculatePip(currentRate, thirtySixWMA)

  let volatility
  try {
    volatility = await calculateVolatility(abbrev)
  } catch (err) {
    throw new Error(`Failed to calculate volatility: ${err}`)
  }

  return {
    currentRate5WMADistance,
    currentRate12WMADistance,
    currentRate36WMADistance,
    volatility
  }
}