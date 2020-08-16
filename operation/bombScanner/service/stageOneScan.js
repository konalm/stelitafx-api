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
    // const log = impulseWave.date.start === '2019-05-08T16:00:00.000Z'
    const log = false

    if (log) {
      console.log(`observe impulse wave for stage one scan`)
      console.log(`impulse wave height .. ${impulseWave.height}`)
    }

    /* Abstract the retrace of the impulse wave */ 
    const relevantCandles = candles.filter((x) => 
      new Date(x.date) > new Date(impulseWave.date.end)
    )
    
    const retraceCandles = []
    for (const [i, candle] of relevantCandles.entries()) {
      if (log) console.log(`retrace candle .. ${candle.date}`)
      

      /* If candle breaches impulse PA. No longer valid. */ 
      if (!paInCandleRange(candle, impulseWave.candles)) break

      /* First candle after impulse is always a retrace */
      if (i === 0) {
        retraceCandles.push(candle)
        continue;
      }

      /* Stopped retracing without exceeding impulse PA? valid stage one setup */ 
      if (!paRetracing(candle, relevantCandles[i - 1], impulseWave.trend, log)) {
        const retraceWave = createRetraceWave(
          impulseWave.trend, 
          retraceCandles, 
          impulseWave.candles[impulseWave.candles.length - 1],
          abbrev,
          log
        )
        stageOne.push(createStageOneItem(impulseWave, retraceWave))
        break
      }

      if (log) {
        console.log(`candle did retrace .. ${candle.date}`)
        console.log()
      }

      retraceCandles.push(candle)
    }
  })

  return stageOne
}


const createRetraceWave = (impulseWaveTrend, candles, impulseWaveLastCandle, abbrev, log = false) => {
  const trend = impulseWaveTrend === 'up' ? 'down' : 'up'

  if (log) {
    console.log(`create retrace wave`)
    console.log(`trend .. ${trend}`)
    console.log(`height .. ${ measureWaveHeight(trend, candles, abbrev)}`)
  }

  return {
    trend,
    date: {
      start: candles[0].date, 
      end: candles[candles.length - 1].date
    },
    candles: [impulseWaveLastCandle, ...candles],
    height: measureWaveHeight(trend, candles, abbrev)
  }
}
