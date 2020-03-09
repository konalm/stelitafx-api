const getCache = require('./getCache')
const getCurrencyPeriods = require('@/currencyRates/services/getCurrencyRates')

const FAST_EMA = 12
const SLOW_EMA = 26
const MACD_EMA = 9

const macdDataPreview = { fastEma: null, slowEma: null, macd: null, macdLag: null, macdHistogram: null }

// module.exports = async (interval, abbrev) => { 
//   console.log(`CALCULATE MACD for .. ${abbrev}`)

//   let macdItems
//   try {
//     macdItems = await getCache(interval, abbrev, 1)
//   } catch (e) {
//     console.log(e)
//     throw new Error('Failed to get prior Macd data')
//   }
//   const priorMacd = macdItems && macdItems.length 
//     ? macdItems[0].macd
//     : macdDataPreview
  
//   console.log('prior macd >>>>')
//   console.log(priorMacd)

//   const ratesAmount = macdItems && macdItems.length  ? 1 : 100
//   let periods
//   try {
//     periods = await getCurrencyPeriods(interval, abbrev, ratesAmount)
//   } catch (e) {
//     throw new Error('Failed to get currency rates')
//   }
//   periods.sort((a, b) => new Date(a.date) - new Date(b.date))
//   const currentRate = periods[periods.length - 1].exchange_rate
//   const priorRates = periods.map((x) => x.exchange_rate)
//   priorRates.pop()


//   const fastEma = getExponentialMovingAverage(
//     currentRate, FAST_EMA, priorMacd.fastEma, priorRates
//   )

//   const slowEma = getExponentialMovingAverage(
//     currentRate, SLOW_EMA, priorMacd.slowEma, priorRates
//   )
//   console.log('got fast and slow EMA ??')

//   const macd = getMacd(fastEma, slowEma)

//   let macdLag = null
//   try {
//     macdLag = await getMacdLag(interval, abbrev, macd, priorMacd.macdLine)
//   } catch (e) {
//     console.log(e)
//     console.log('Failed to get macd lag')
//   }

//   const macdHistogram = macdLag ? getMacdHistogram(macd, macdLag) : null;

//   return { fastEma, slowEma, macd, macdLag, macdHistogram }
// }

module.exports = (rates) => {
  const periods = []

  rates.forEach((rate, i) => {
    const index = periods.length + 1
    const priorPeriods = [...periods];
    const priorPrices = priorPeriods.map(x => x.rate)

    const priorPeriod = periods[periods.length - 1]
    let shortEma, longEma, macd, macdLag = null
    
    if (priorPeriod) {
      shortEma = getExponentialMovingAverage(
        rate.rate, FAST_EMA, priorPeriod.shortEma, priorPrices
      )

      longEma = getExponentialMovingAverage(
        rate.rate, SLOW_EMA, priorPeriod.longEma, priorPrices
      )

      if (shortEma && longEma) macd = getMacd(shortEma, longEma)

      macdLag = getMacdLag(macd, periods)
    }

    const period = {
      index,
      date: rate.date,
      rate: rate.rate,
      shortEma,
      longEma,
      macdLine: macd,
      macdLag,
      macdHistogram: getMacdHistogram(macd, macdLag)
    }
    periods.push(period)
  })

  return periods[periods.length - 1]
}


const getExponentialMovingAverage = (currentRate, emaLength, priorEma, priorRates) => {
  if (priorRates.length < emaLength) return null

  /* first EMA is the SMA */
  if (priorRates.length === emaLength) return getSimpleMovingAverage(priorRates)

  const multiplier = (2 / (emaLength + 1))
  return (currentRate - priorEma) * multiplier + priorEma
}


const getSimpleMovingAverage = (prices) => {
  const sum = prices.reduce((sum, x) => sum + x, 0)

  return sum / prices.length
}


const getMacdLag = (currentMacd, periods) => {
  const periodsWithMacd = periods.filter((x) => ![undefined, null].includes(x.macdLine))
  const priorPrices =  periodsWithMacd.map((x) => x.macdLine)
  const priorPeriod = periodsWithMacd[periodsWithMacd.length - 1]
  const priormacdLag = priorPeriod ? priorPeriod.macdLag : null

  return getExponentialMovingAverage(currentMacd, MACD_EMA, priormacdLag, priorPrices)
}


const getMacd = (fastEma, slowEma) => fastEma - slowEma


const getMacdHistogram = (macd, macdLag) =>  ![undefined, null].includes(macdLag) ? macd - macdLag : null

