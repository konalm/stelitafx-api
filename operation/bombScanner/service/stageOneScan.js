const paRetracing = require('./PARetracing')
const paInCandleRange = require('./isPAInCandleRange')
const measureWaveHeight = require('./measureWaveHeight')
const createStageOneItem = require('./createStageOneItem')


/**
 * Loop impulse waves to find ones with a valid retrace to pass as stage one setup 
 **/

module.exports = (impulseWaves, candles, abbrev) => {
  const stageOne = []

  impulseWaves.forEach((impulseWave) => {
    /* Abstract the retrace of the impulse wave */ 
    const relevantCandles = candles.filter((x) => 
      new Date(x.date) >= new Date(impulseWave.date.end)
    )
    
    const retraceCandles = []
    for (const [i, candle] of relevantCandles.entries()) {
      /* If candle breaches impulse PA. No longer valid. */ 
      if (!paInCandleRange(candle, impulseWave.candles)) break

      /* First candle after impulse is always a retrace */
      if (i === 0) {
        retraceCandles.push(candle)
        continue;
      }

      /* Stopped retracing without exceeding impulse PA? valid stage one setup */ 
      if (!paRetracing(candle, relevantCandles[i - i], impulseWave.trend)) {
        const retraceWave = createRetraceWave(impulseWave.trend, retraceCandles, abbrev)
        stageOne.push(createStageOneItem(impulseWave, retraceWave))
        break
      }
    
      retraceCandles.push(candle)
    }
  })

  return stageOne
}


const createRetraceWave = (impulseWaveTrend, candles, abbrev) => {
  const trend = impulseWaveTrend === 'up' ? 'down' : 'up'

  return {
    trend,
    date: {
      start: candles[0].date, 
      end: candles[candles.length - 1].date
    },
    candles: candles,
    height: measureWaveHeight(trend, candles, abbrev)
  }
}
