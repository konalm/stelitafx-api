require('module-alias/register');
const getCandles = require('./service/getCandles');
const constructWaves = require('./service/constructWaves');
const getHeikinAshiCandles = require('../../candle/service/heikinAshiCandles');
const getCandleUpperTrends = require('../../candle/service/candleUpperTrends');
const indexCandleBenchmarkBreak = require('./service/indexCandleBenchmarkBreak');

const ABBREV = 'EURUSD';
const GRAN = 'H1';
const SINCEDATE = '2019-02-01T00:00:00.000Z';
const ENDDATE = '2019-03-01T00:00:00.000Z';
const BUFFER = 7;

(async () => {
  const candles = await getCandles(GRAN, ABBREV, SINCEDATE, ENDDATE)
  const heikenAshiCandles = getHeikinAshiCandles(candles)
  const candlesWithUpperTrend = getCandleUpperTrends(heikenAshiCandles)

  console.log(`candles .. ${candles.length}`)
  console.log()

  candles.forEach((x) => {
    const relCandleWithUpperTrend = candlesWithUpperTrend.find((y) => 
      y.date.getTime() === x.date.getTime()
    )
    x.upperTrend = relCandleWithUpperTrend.upperTrend
  })
  
  const waves = constructWaves(candles)

 
  let x = 0
  waves.forEach((wave, i) => {
    if (i === 0) return 

    const priorWave = waves[i - 1]
    const priorPriorWave = i > 1 ? waves[i - 2] : null 
    const priorTrend = waveTrend(priorPriorWave, priorWave)

    // console.log('wave -->')
    // console.log(wave.end.date)



    if (wave.end.date.toISOString() === '2019-02-05T08:00:00.000Z') {
      console.log('OBSERVING 05 08')
      console.log(`wave height .. ${wave.height}`)
      console.log(`prior wave height .. ${priorWave.height}`)
      console.log(`direction .. ${wave.direction}`)
      console.log(`prior wave direction .. ${priorWave.direction}`)
      console.log(`prior trend .. ${priorTrend}`)
      console.log()
      console.log('prior wave -->')
      console.log(priorWave.direction)
      console.log(priorWave.height)
      console.log(priorWave.start.date)
      console.log(priorWave.end.date)
      console.log()
      console.log('prior prior wave --->')
      console.log(priorPriorWave.direction)
      console.log(priorPriorWave.height)
      console.log(priorPriorWave.start.date)
      console.log(priorPriorWave.end.date)
      console.log()
    }

    if (wave.height > (priorWave.height + BUFFER)) {
      const indexCandleBreak = indexCandleBenchmarkBreak(wave, priorWave.height, BUFFER)
      const candleBrokeBenchmark = wave.candles[indexCandleBreak].date
      
      if (wave.direction === 'up') {
        if (priorTrend === 'down') {
          console.log('BULLET, GO LONG')
          // console.log(wave.end.date)
          // console.log('candle that broke -->')
          console.log(candleBrokeBenchmark)
          console.log()
          x ++
        }
      }

      if (wave.direction === 'down') {
        if (priorTrend === 'up') {
          console.log('BULLET, GO SHORT')
          // console.log(wave.end.date)
          // console.log('candle that broke -->')
          console.log(candleBrokeBenchmark)
          console.log()
          x ++
        }
      }
    }
  })
  console.log(`BULLETS .... ${x}`)
})();

const waveTrend = (waveA, waveB) => {
  if (waveA === null) return waveB.direction

  if (waveA.height > waveB.height) return waveA.direction
  return waveB.direction 
}