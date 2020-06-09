const { candleStats, isTimesBigger } = require('@/operation/candlePatterns/service')

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

    // if (isTimesBigger(currentCandle.body, priorCandle.size, 1.0)) return true
  }
  
  return false 
}


const candleBodyLength = (candle) => parseFloat(candle.o) - parseFloat(candle.l)

const candleLength = (candle) => parseFloat(c)


exports.alwaysTrue = (prior, current) => true

exports.alwaysFalse = (prior, current) => false

exports.bullCandle = (candle) => {
  return candle.close > candle.open
}

exports.bearCandle = (candle) => {
  return candle.open > candle.close
}