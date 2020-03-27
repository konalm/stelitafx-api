const FAST_EMA = 12
const SLOW_EMA = 26
const MACD_EMA = 9


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

