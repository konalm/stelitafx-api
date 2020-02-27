module.exports = (periods) => {
  const calcPeriods = []

  periods.forEach((current, i) => {
    if (i === 0) calcPeriods.push(current)

    const prior = calcPeriods[calcPeriods.length - 1]

    const dm = getDM(prior, current)
    const trueRange = getTrueRange(prior, current)
    const trueRange14 = smoothen14('trueRange', calcPeriods, trueRange, prior.trueRange14)
    const plusDM14 = smoothen14('plusDM', calcPeriods, dm.plus, prior.plusDM14)
    const minusDM14 = smoothen14('minusDM', calcPeriods, dm.minus, prior.minusDM14)

    const plusDI14 = directionalMovement14(plusDM14, trueRange14, i)
    const minusDI14 = directionalMovement14(minusDM14, trueRange14, i)

    const DI14Diff = direction14Diff(plusDI14, minusDI14, i)
    const DI14Sum = direction14Sum(plusDI14, minusDI14, i)
    const dx = getDx(DI14Diff, DI14Sum, i)

    const newPeriod = {
      index: i,
      ...current,
      trueRange,
      plusDM: dm.plus,
      minusDM: dm.minus,
      trueRange14: smoothen14('trueRange', calcPeriods, trueRange, prior.trueRange14),
      plusDM14,
      minusDM14,
      plusDI14,
      minusDI14,
      DI14Diff,
      DI14Sum,
      dx,
      adx: getAdx(calcPeriods, dx, prior.adx, i)
    }

    calcPeriods.push(newPeriod)
  })

  const finalPeriod = calcPeriods[calcPeriods.length - 1]

  
  return {
    plusDi: finalPeriod.plusDI14 || 0.00,
    minusDi: finalPeriod.minusDI14 || 0.00,
    adx: finalPeriod.adx || 0.00,
  }
}


const getAdx = (periods, currentDX, priorAdx) => {
  let dx = [...periods.filter((x) => x.dx ).map((y) => y.dx)]
  dx.push(currentDX);

  if (dx.length < 14) return null

  if (dx.length > 150) {
    const last = dx.length - 1
    dx = [...dx.slice(last - 150, last)]
  }

  // First ADX14 .. 14 period average of dx
  if (dx.length === 14) round(dx.reduce((sum, x) => sum + x) / 14)
  

  // Smoothen subsequent ADX
  if (dx.length > 14) round(( (priorAdx * 13) + currentDX ) / 14)
}


const getDx = (DI14Diff, DI14Sum, index) => {
  if (index < 14) return null 

  return round( Math.abs(DI14Diff / DI14Sum) * 100)
}


const direction14Diff = (plusDM14, minusDM14, index) => {
  if (index < 14) return null 

  return round( Math.abs(plusDM14 - minusDM14) )
}


const direction14Sum = (plusDM14, minusDM14, index) => {
  if (index < 14) return null

  return round( Math.abs(plusDM14 + minusDM14) )
}


const directionalMovement14 = (dm14, tr14, index) => {
  if (index < 14) return null

  return round(dm14 / tr14 * 100)
}


const smoothen14 = (type, periods, current14, prior14) => {
  let averaged14 = null

  /* First TR14 .. Sum of first 14 periods of TR1 */ 
  if (periods.length === 14) {
    const sumOfPrior1 = periods.reduce((sum, x) => sum + x[type], 0)
    averaged14 = sumOfPrior1 + current14;
  } 
  
  /* Subsequent TR14 are smoothened */
  else if (periods.length > 14) {
    averaged14 = prior14 - (prior14 / 14) + current14
  }

  return round(averaged14) || null
}


const getTrueRange = (prior, current) => {
  const highMinusLow = current.high - current.low
  const highMinusPriorClose = Math.abs(current.high - prior.close)
  const lowMinusPriorClose = Math.abs(current.low - prior.close)
  
  return Math.max(highMinusLow, highMinusPriorClose, lowMinusPriorClose)
}


const getDM = (prior, current) => {
  const plusDM = current.high - prior.high
  const minusDM = prior.low - current.low

  return {
    plus: plusDM > minusDM && plusDM > 0 ? plusDM : 0,
    minus: minusDM > plusDM && minusDM > 0 ? minusDM : 0,
  }
}


const round = (num) => Math.round(num * 100) / 100
