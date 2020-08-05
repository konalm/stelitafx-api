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

    /* trend terminated */
    if (trend && trend !== wave.trend) {
      /* close current wave */
      wave.date.end = candle.date 
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