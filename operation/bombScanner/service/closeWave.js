const measureWaveHeight = require('./measureWaveHeight')


module.exports = (wave, candle, allWaves, abbrev) => {
  wave.date.end = candle.date 

  const height = measureWaveHeight(wave.trend, wave.candles, abbrev)
  
  // console.log(`height .. ${height}`)
  
  const priorWave = allWaves[allWaves.length - 2]
  let retraceHeight = null

  if (allWaves.length >= 2) {
    retraceHeight = measureWaveHeight(
      wave.trend, 
      [priorWave.candles[priorWave.candles.length - 1], ...wave.candles],
      abbrev
    )
    

    // waveType = height >= priorWave.height ? 'impulse' : 'retrace'

    /* for retrace add last impulse candle so can measure height of retrace 
      from the impulse */ 
    // if (waveType === 'retrace') {
    //   retraceHeight = measureWaveHeight(
    //     wave.trend, 
    //     [priorWave.candles[priorWave.candles.length - 1], ...wave.candles],
    //     abbrev
    //   )
    //   console.log(`retrace height --> ${retraceHeight}`)
    // }
  }
  
  return {
    date: {
      start: wave.date.start,
      end: candle.date,
    },
    height: height,
    // type: waveType,
    retrace: retraceHeight && retraceHeight < priorWave.height,
    retraceHeight
  }
}