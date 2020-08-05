const { candleStats, isTimesBigger } = require('@/operation/candlePatterns/service')
const getProgressiveCandleTrend = require('@/operation/service/progressiveCandleTrend');

exports.wmaConjoinedStochastic = (prior, current) => {
  if (!prior) return false

  return {
    openConditions: wmaOver(current, 10, 50) && stochasticCrossedOver(prior, current, 50),
    closeConditions: wmaUnder(current, 10, 50) || stochasticCrossedUnder(prior, current, 70)
    // closeConditions: wmaUnder(current, 5, 50) || current.stochastic > 85
  }
}


exports.stochasticTwentyEighty = (prior, current) => {
  if (!prior) return false

  return {
    openConditions: current.stochastic >= 80,
    closeConditions: current.stochastic <= 20
  }
}


exports.twentyCrossoverTwoHundedWMA = (prior, current) => {
  if (!prior) return false 

  return {
    openConditions: wmaCrossedOver(prior, current, 20, 200),
    closeConditions: wmaUnder(current, 20, 200)
  }
}


exports.twentyCrossunderTwoHundredWMA = (prior, current) => {
  if (!prior) return false 

  return {
    openConditions: wmaCrossedUnder(prior, current, 20, 200),
    closeConditions: wmaOver(current, 20, 200)
  }
}


exports.tenCrossoverOneHundredWMA = (prior, current) => {
  if (!prior) return false 

  return {
    openConditions: wmaCrossedOver(prior, current, 10, 100),
    closeConditions: wmaUnder(current, 10, 100)
  }
}



exports.stochasticCrossedOver = (prior, current, triggerStoch) => {
  // console.log('CONDITIONS .. stochastics crossed over')

  return (prior.stochastic < triggerStoch) && (current.stochastic >= triggerStoch)
}


exports.stochasticCrossedUnder = (prior, current, triggerStoch) => {
  return (prior.stochastic >= triggerStoch) && (current.stochastic < triggerStoch)
}

exports.wmaCrossedUnder = (prior, current, shortWma, longWma) => {
  if (!prior.wma[shortWma] || !prior.wma[longWma]) return false

  return (
    prior.wma[shortWma] >= prior.wma[longWma] && 
    current.wma[shortWma] < current.wma[longWma]
  )
}

exports.wmaCrossedOver = (prior, current, shortWma, longWma) => {
  if (!prior.wma[shortWma] || !prior.wma[longWma]) return false

  return (
    prior.wma[shortWma] <= prior.wma[longWma] && 
    current.wma[shortWma] > current.wma[longWma]
  ) 
}

exports.wmaUnder = (current, shortWma, longWma) => {
  if (!current.wma[shortWma] || !current.wma[longWma]) return false

  return current.wma[shortWma] < current.wma[longWma]
}


exports.rateAboveWma = (current, wma) => {
  return current.rate > current.wma[wma]
}


exports.wmaOver = (current, shortWma, longWma) => {
  if (!current.wma[shortWma] || !current.wma[longWma]) return false

  return current.wma[shortWma] > current.wma[longWma]
}

exports.adxCrossover = (prior, current) => prior.adx.plusDi <= prior.adx.minusDi 
  && current.adx.plusDi > current.adx.minusDi


exports.adxCrossunder = (prior, current) => prior.adx.minusDi >= prior.adx.plusDi 
  && current.adx.minusDi < current.adx.plusDi

  
exports.adxPlusDiUnder = (prior, current) => current.adx.plusDi <= current.adx.minusDi


exports.adxPlusDiAbove = (prior, current) => {
  return current.adx.plusDi >= current.adx.minusDi
}

exports.adxAboveThreshold = (prior, current, threshold) => current.adx.adx >= threshold


exports.adxBelowThreshold = (prior, current, threshold) => current.adx.adx <= threshold


exports.adxPlusDiAboveThreshold = (prior, current, threshold) => current.adx.plusDi > threshold

exports.adxMinusDiAboveThreshold = (prior, current, threshold) => {
  // console.log(current.adx)

  return current.adx.minusDi > threshold
}

exports.adxBelowDiBelowThreshold = (current, threshold) => current.adx.minusDi > threshold


exports.adxPlusDiBelowThreshold = (prior, current, threshold) => current.adx.plusDi < threshold


exports.macdCrossedOver = (prior, current) =>  {
  return (prior.macd.macdLine < prior.macd.macdLag) && (current.macd.macdLine > current.macd.macdLag)
}

exports.macdCrossedUnder = (prior, current) =>  {
  return (prior.macd.macdLine >= prior.macd.macdLag) && (current.macd.macdLine < current.macd.macdLag)
}

exports.macdAbove = (prior, current) => {
  return current.macd.macdLine >= current.macd.macdLag
}

exports.macdUnder = (prior, current) => current.macd.macdLine <= current.macd.macdLag

exports.macdBelowThreshold = (prior, current, threshold) => {
  return current.macd.macdLine < threshold 
}

exports.macdHistogramAboveThreshold = (prior, current, threshold) => {
  // console.log('macd histogram above threshold')
  // console.log(current.macd)
  return current.macd.macdHistogram >= threshold
}

exports.macdHistogramBelowThreshold = (prior, current, threshold) => {
  return current.macd.histogram <= threshold
}

exports.rateClosedOverWma = (prior, current, wma) => {
  if (!prior.wma[wma]) return false

  return prior.rate <= prior.wma[wma] && current.rate > current.wma[wma]
}

exports.rateClosedUnderWma = (prior, current, wma) => {
  if (!prior.wma[wma]) return false

  return prior.rate >= prior.wma[wma] && current.rate < current.wma[wma]
}

exports.rateBelowWma = (current, wma) => current.rate < current.wma[wma]

exports.rateBelowUpperPeriodWma = (current, upperPeriod, wma) => {
  return current.rate < current.upperPeriods[upperPeriod].wma[wma]
}

exports.engulfedCandle = (prior, current) => {
  const priorCandle = candleStats(prior.candle)
  const currentCandle = candleStats(current.candle)

  if (priorCandle.type === 'bear' && currentCandle.type === 'bull') {
    if (currentCandle.body >= priorCandle.size) return true
  }
  
  return false 
}


const candleBodyLength = (candle) => parseFloat(candle.o) - parseFloat(candle.l)

const candleLength = (candle) => parseFloat(c)


exports.alwaysTrue = (prior, current) => true

exports.alwaysFalse = (prior, current) => false

exports.bullCandle = (candle) => {
  return parseFloat(candle.c) > parseFloat(candle.o)
}

exports.bearCandle = (candle) => {
  return candle.open > candle.close
}

exports.volumeThrust = (prior, current, thrust) => {
  return current.volume > (prior.volume * thrust) 
}

exports.minVolume = (prior, current, min) => {
  return current.volume > min
}

exports.trendUp = (current) => {
  return current.trend === 'up'
}

exports.upperTrendUp = (current) => {
  // console.log('upper trend up')
  // console.log(current)

  return current.upperTrend === 'up'
}

exports.upperTrendDown = (current) => {
  return current.upperTrend === 'down'
}

exports.trendDown = (current) => {
  return current.trend === 'down'
}

exports.progressiveTrendUp = (current, haTrendGroups, haCandles) => {
  const progressiveTrendUp = getProgressiveCandleTrend(current, haTrendGroups, haCandles)

  return progressiveTrendUp && progressiveTrendUp.upperTrend === 'up'
}


exports.progressiveUpperTrendUp = (current, haTrendGroups, haCandles) => {

}


exports.periodLow = (current, candles, length) => {
  const index = candles.findIndex((x) => x.date === current.date)
  if (index + 1 < length) return false 

  const indices = []
  for (let i = index - length + 1; i <= index; i++) indices.push(i)
  const relevantCandles = indices.map(i => candles[i])

  const priorCandles = relevantCandles.splice(0, length - 1)
  const priorCandleLow = priorCandles.reduce((a, b) => a.close < b.close ? a : b)

  return relevantCandles[0].close < priorCandleLow.close
}


exports.periodHigh = (current, candles, length) => {
  const index = candles.findIndex((x) => x.date === current.date)
  if (index + 1 < length) return false 

  const indices = []
  for (let i = index - length + 1; i <= index; i++) indices.push(i)
  const relevantCandles = indices.map(i => candles[i])

  const priorCandles = relevantCandles.splice(0, length - 1)
  const priorCandleHigh = priorCandles.reduce((a, b) => a.close > b.close ? a : b)

  return relevantCandles[0].close > priorCandleHigh.close
}

exports.rsiAbove = (current, thresh) => {
  // console.log(`rsi above .. ${thresh}`)
  // console.log(current.rsi)

  if (!current.rsi) return false

  return current.rsi.rsi >= thresh
}

exports.rsiBelow = (current, thresh) => {
  // console.log('rsi below')
  // console.log(current.rsi)

  if (!current.rsi) return false

  return current.rsi.rsi <= thresh
}