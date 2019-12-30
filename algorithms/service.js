const config = require('../config');
const wmaRepo = require('../wma/repository')
const movingAverageRepo = require('../movingAverage/repository')
const tradeRepo = require('../trade/repository');
const calculatePip = require('../services/calculatePip')
const calculateVolatility = require('../services/calculateVolatility')
const dbConnections = require('../dbConnections')


exports.getCurrentAndPrevWMAs = async (
  abbrev, 
  timeInterval = 1, 
  currencyRateSource = ''
) => {
  const s = new Date() 

  // dbConnections('get current and prev WMA')

  let wmaDataPoints;
  try {
    wmaDataPoints = await wmaRepo.getWMAs(abbrev, timeInterval, 2, 0, currencyRateSource)
  } catch (err) {
    throw new Error('could not get WMAs:' + err);
  }

  const WMA = wmaDataPoints[0];
  const prevWMA = wmaDataPoints.length > 1 ? wmaDataPoints[1] : null;

  const e = new Date()
  const diff = e.getTime() - s.getTime()
  const secondsDiff = diff / 1000
  // console.log(`getting current & prev WMAs took --> ${secondsDiff}`)

  return {WMA, prevWMA};
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