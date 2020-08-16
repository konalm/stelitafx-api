const firstWave = require('./firstWave')
const measureWaveHeight = require('./measureWaveHeight')
const getCurrentTrend = require('./getCurrentTrend')

const MIN_HEIGHT = 25

module.exports = (candles, abbrev) => {
  const waves = []

  candles.forEach((candle, i) => {
    if (i === 0) {
      waves.push(firstWave(candle))
      return 
    }

    const wave = waves[waves.length - 1]
    const trend = getCurrentTrend(candle, candles[i - 1])

    // const log = stageOneItem.impulseWave.date.start === '2019-08-01T13:00:00.000Z'


    // if (candle.date === '2019-01-08T00:00:00.000Z') {
    //   console.log(`looking at candle .. ${candle.date}`)
    //   console.log(`trend .. ${trend}`)
    // }

    /* trend terminated */
    if (trend && trend !== wave.trend) {
      /* splice all candles post impulse high */ 
      wave.candles.splice(getHighestCandleIndex(wave.candles, wave.trend) + 1, wave.candles.length)

      wave.date.end = wave.candles[wave.candles.length - 1].date 
      wave.height = measureWaveHeight(wave.trend, wave.candles, abbrev)
      
      /* start new wave */ 
      waves.push({ trend, date: { start: candle.date }, candles: [candle] })
    } else {
      /* trend continued */
      wave.candles.push(candle)
    }
  })

  return waves.filter((x) => x.height >= MIN_HEIGHT)
}


const getHighestCandleIndex = (candles, trend) => {
  if (trend === 'up') {
    const highestHigh = candles.reduce((a, b) => a.high > b.high ? a : b, 0).high
    return candles.findIndex((x) => x.high === highestHigh)
  }

  else {
    const lowestLow = candles.reduce((a, b) => a.low < b.low ? a : b, 0).low 
    return candles.findIndex((x) => x.low === lowestLow)
  }
}