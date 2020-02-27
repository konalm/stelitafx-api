const getCache = require('./getCache')
const getCurrencyPeriods = require('@/currencyRates/services/getCurrencyRates')

const FAST_EMA = 12
const SLOW_EMA = 26
const MACD_EMA = 9

const macdDataPreview = { fastEma: null, slowEma: null, macd: null, macdLag: null, macdHistogram: null }

module.exports = async (interval, abbrev) => {
  console.log(`CALCULATE MACD for .. ${abbrev}`)

  let macdItems
  try {
    macdItems = await getCache(interval, abbrev, 1)
  } catch (e) {
    console.log(e)
    throw new Error('Failed to get prior Macd data')
  }
  const priorMacd = macdItems && macdItems.length 
    ? macdItems[0].macd
    : macdDataPreview
  
  console.log('priormacd >>>>')
  console.log(priorMacd)

  const ratesAmount = macdItems && macdItems.length  ? 1 : 100
  let periods
  try {
    periods = await getCurrencyPeriods(interval, abbrev, ratesAmount)
  } catch (e) {
    throw new Error('Failed to get currency rates')
  }
  periods.sort((a, b) => new Date(a.date) - new Date(b.date))
  const currentRate = periods[periods.length - 1].exchange_rate
  const priorRates = periods.map((x) => x.exchange_rate)
  priorRates.pop()


  const fastEma = getExponentialMovingAverage(
    currentRate, FAST_EMA, priorMacd.fastEma, priorRates
  )

  const slowEma = getExponentialMovingAverage(
    currentRate, SLOW_EMA, priorMacd.slowEma, priorRates
    )

  const macd = getMacd(fastEma, slowEma)

  let macdLag = null
  try {
    await getMacdLag(interval, abbrev, macd, priorMacd.macdLine)
  } catch (e) {
    console.log('Failed to get macd lag')
  }

  const macdHistogram = macdLag ? getMacdHistogram(macd, macdLag) : null;

  return { fastEma, slowEma, macd, macdLag, macdHistogram }
}


const getExponentialMovingAverage = (currentRate, emaLength, priorEma, priorRates) => {
  /* first EMA is the SMA */
  const getSimpleMovingAverage = (r) => {
    r.splice(priorRates.length - emaLength, priorRates.length)

    if (r.length < emaLength) {
      throw new Error('Could not calculate SMA, ema length exceeds prior rates')
    }

    return r.reduce((sum, x) => sum + x, 0) / r.length
  }
  
  if (!priorEma) return getSimpleMovingAverage(priorRates)
  
  const multiplier = (2 / (emaLength + 1))
  return (currentRate - priorEma) * multiplier + priorEma
}


const getMacdLag = async (interval, abbrev, currentMacd, priorMacd) => {
  /* first macd lag is sma of macd line */
  let priorMacdItems = []
  if (!priorMacd) {
    let priorMacdDataItems
    try {
      priorMacdDataItems = await getCache(interval, abbrev, MACD_EMA)
    } catch (e) {
      console.log(e)
      throw new Error(`Failed to get prior Macd items for Macd lag`)
    }

    if (priorMacdDataItems.length < MACD_EMA) {
      console.log('not enough macd lines to calculate macd lag')
      return null;
    }

    priorMacdItems = priorMacdDataItems.map(x => x.macd.macdLine)
  }
  
  return this.getEma(currentMacd, MACD_EMA, priorMacd, priorMacdItems)
}


const getMacd = (fastEma, slowEma) => fastEma - slowEma


const getMacdHistogram = (macd, macdLag) =>  macd && macdLag ? macd - macdLag : null

