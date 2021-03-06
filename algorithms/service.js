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
const getCachedMacdItems = require('@/indicators/macd/service/getCache')
const symbolToAbbrev = require('@/services/symbolToAbbrev')


/**
 * 
 */
exports.getHigherPeriodData = async (abbrev, gran) => {
  const symbol = symbolToAbbrev(abbrev)

  const promises = []

  if (!config.CRYPTO_CURRENCYPAIRS.includes(symbol)) {
    config.GRANS.forEach((gran) => {
      promises.push(getCurrencyPairWma(abbrev, gran))
    })
  } else {
    console.log('is a crypto !')

    config.CRYPTO_CRANS.forEach((gran) => {
      promises.push(getCurrencyPairWma(abbrev, gran))
    })
  }

  let higherPeriodData
  try {
    higherPeriodData = await Promise.all(promises)
  } catch (e) {
    console.log('PROMISE FAILED')
    return reject(e)
  }

  const higherPeriods = {}
  higherPeriodData.forEach((x) => {
    higherPeriods[x.gran] = x.data
  })

  return higherPeriods
}

/**
 * 
 */
const getCurrencyPairWma = (abbrev, gran) => new Promise(async (resolve, reject) => {
  let cachedWmas
  try {
    cachedWmas = await getCachedWMA(gran, abbrev, 1)
  } catch (e) {
    console.log(e)
    console.error('Failed to get cached WMAs')
  }

  const cachedWma = cachedWmas[0]

  resolve({ gran, data: cachedWma })
})

/**
 * 
 */
exports.getCurrentAndPriorMacdItems = async (interval, abbrev) => {
  let macdItems
  try {
    macdItems = await getCachedMacdItems(interval, abbrev, 2)
  } catch (e) {
    console.error('Failed to get cached macd items')
  }

  if (!macdItems || !macdItems.length) return 

  return {
    current: macdItems[0].macd,
    prior: macdItems[1].macd
  }
}

/**
 * 
 */
exports.getCurrentAndPrevWMAs = async (
  abbrev, 
  timeInterval = 1, 
  currencyRateSource = ''
) => {
  const s = new Date() 

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

  return { 
    current: stochastics.length ? stochastics[0].stochastic : null, 
    prev: stochastics.length > 1 ? stochastics[1].stochastic : null
  }
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


exports.macdCrossedOver = (current, prior) => {
  if (prior.macdLine <= prior.macdLag) {
    if (current.macdLine > current.macdLag) return true
  }

  return false
}


exports.macdCrossedUnder = (current, prior) => {
  if (prior.macdLine >= prior.macdLag) {
    if (current.macdLine < current.macdLag) return true
  }

  return false
}


exports.macdUnderLag = (current) => current.macdLine < current.macdLag


exports.macdHistogramDecreased = (current, prior) => {
  return current.macdHistogram < prior.macdHistogram
}


exports.macdHistogramIncreased = (current, prior) => {
  return current.macdHistogram > prior.macdHistogram
}