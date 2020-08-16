module.exports = (impulseWave, retraceWave) => {
  let highPoint, lowPoint = null 
  const lastImpulseCandle = impulseWave.candles[impulseWave.candles.length - 1]
  const lastRetraceCandle = retraceWave.candles[retraceWave.candles.length - 1]

  const log = impulseWave.date.start === '2019-08-01T13:00:00.000Z'


  if (impulseWave.trend === 'up') {
    highPoint = lastImpulseCandle.high 
    lowPoint = lastRetraceCandle.low 
  } else {
    highPoint = lastImpulseCandle.low 
    lowPoint = lastRetraceCandle.high 
  }

  const firstImpulseCandle = impulseWave.candles[0]


  // console.log(`HIGH POINT .. ${highPoint}`)
  // console.log(`LOW POINT .. ${lowPoint}`)


  // if (log) {
  //   console.log()
  //   console.log('CREATE STAGE ONE ITEM')
  //   console.log(`high point .. ${highPoint}`)

  //   console.log('last impulse candle -->')
  //   console.log(lastImpulseCandle)

  //   console.log(`impulse wave trend .. ${impulseWave.trend}`)
  //   console.log(`impulse wave type .. ${impulseWave.type}`)
  //   console.log()
  // }


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