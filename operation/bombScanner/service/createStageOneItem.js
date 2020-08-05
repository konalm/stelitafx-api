module.exports = (impulseWave, retraceWave) => {
  let highPoint, lowPoint = null 
  const lastImpulseCandle = impulseWave.candles[impulseWave.candles.length - 1]
  const lastRetraceCandle = retraceWave.candles[retraceWave.candles.length - 1]

  if (impulseWave.type === 'up') {
    highPoint = lastImpulseCandle.high 
    lowPoint = lastRetraceCandle.low 
  } else {
    highPoint = lastImpulseCandle.low 
    lowPoint = lastRetraceCandle.high 
  }

  const firstImpulseCandle = impulseWave.candles[0]


  // console.log(`HIGH POINT .. ${highPoint}`)
  // console.log(`LOW POINT .. ${lowPoint}`)

  return {
    impulseWave,
    retraceWave,
    highPoint,
    lowPoint,
    startPoint: impulseWave.type === 'up' ? firstImpulseCandle.low : firstImpulseCandle.high,
    processing: true,
    trend: impulseWave.trend
  }
}