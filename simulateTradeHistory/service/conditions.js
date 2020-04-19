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


exports.tenCrossoverOneHundreddWMA = (prior, current) => {
  if (!prior) return false 

  return {
    openConditions: wmaCrossedOver(prior, current, 10, 100),
    closeConditions: wmaUnder(current, 10, 100)
  }
}


exports.stochasticCrossedOver = (prior, current, triggerStoch) => {
<<<<<<< HEAD
  return (prior.stochastic <= triggerStoch) && (current.stochastic > triggerStoch)
=======
  // console.log('CONDITIONS .. stochastics crossed over')

  return (prior.stochastic < triggerStoch) && (current.stochastic >= triggerStoch)
>>>>>>> eecd458caa46618ff6a1d3a274caef23fd018e63
}

exports.stochasticCrossedUnder = (prior, current, triggerStoch) => {
  return (prior.stochastic >= triggerStoch) && (current.stochastic < triggerStoch)
}

const wmaCrossedUnder = (prior, current, shortWma, longWma) => {
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

exports.wmaUnder = (prior, current, shortWma, longWma) => {
  console.log('wma under condition')

  console.log(`short wma ... ${current.wma[shortWma]}`)
  console.log(`long wma ... ${current.wma[longWma]}`)

  if (!current.wma[shortWma] || !current.wma[longWma]) return false


<<<<<<< HEAD
  return current.wma[shortWma] < current.wma[longWma]
}
=======
exports.rateAboveWma = (current, wma) => current.exchange_rate > current.wma[wma]
>>>>>>> eecd458caa46618ff6a1d3a274caef23fd018e63

const wmaOver = (current, shortWma, longWma) => {
  if (!current.wma[shortWma] || !current.wma[longWma]) return false

<<<<<<< HEAD
  return current.wma[shortWma] > current.wma[longWma]
}
=======
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


exports.adxPlusDiBelowThreshold = (prior, current, threshold) => current.adx.plusDi < threshold
>>>>>>> eecd458caa46618ff6a1d3a274caef23fd018e63
