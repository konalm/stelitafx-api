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

exports.wmaCrossover = (prior, current, shortWma, longWma) => {
  if (!prior) return false 

  return {
    openConditions: this.wmaCrossedOver(prior, current, shortWma, longWma),
    closeConditions: this.wmaUnder(prior, current, shortWma, longWma)
  }
}


exports.twentyCrossoverTwoHundedWMA = (prior, current) => {
  if (!prior) return false 

  return {
    openConditions: this.wmaCrossedOver(prior, current, 20, 200),
    closeConditions: this.wmaUnder(current, 20, 200)
  }
}


exports.twentyCrossunderTwoHundredWMA = (prior, current) => {
  if (!prior) return false 

  return {
    openConditions: wmaCrossedUnder(prior, current, 20, 200),
    closeConditions: wmaOver(current, 20, 200)
  }
}


exports.tenCrossoverOneHundreddWMA = (prior, current) => {
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

exports.wmaOver = (current, shortWma, longWma) => {
  // console.log(`wma over ... ${shortWma} .. ${longWma}`) 

  if (!current.wma[shortWma] || !current.wma[longWma]) return false

  return current.wma[shortWma] > current.wma[longWma]
}


exports.rateAboveWma = (current, wma) => current.exchange_rate > current.wma[wma]

exports.rateBelowWma = (current, wma) => current.exchange_rate < current.wma[wma]


exports.adxCrossover = (prior, current) => prior.adx.plusDi <= prior.adx.minusDi 
  && current.adx.plusDi > current.adx.minusDi


exports.adxCrossunder = (prior, current) => prior.adx.minusDi >= prior.adx.plusDi 
  && current.adx.minusDi < current.adx.plusDi

  
exports.adxPlusDiUnder = (prior, current) => current.adx.plusDi <= current.adx.minusDi


exports.adxPlusDiAbove = (prior, current) => {
  // console.log('CONDITIONS ... adx plus di above');

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

exports.macdAbove = (prior, current) => {
  // console.log('prior >>')
  // console.log(prior)
  // console.log('condition ... macd above')

  // console.log('current >>')
  // console.log(current.macd)

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


