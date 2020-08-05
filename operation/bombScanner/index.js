require('module-alias/register');
const fs = require('fs');
const _ = require('lodash')
const calculatePip = require('@/services/calculatePip')

const getCandles = require('./service/getCandles')
const getCurrentTrend = require('./service/getCurrentTrend')
const measureWaveHeight = require('./service/measureWaveHeight')
const closeWave = require('./service/closeWave')
const createStageOneItem = require('./service/createStageOneItem')
const createBombItem = require('./service/createBombItem')
const stageProceededPoint = require('./service/stageProceededPoint');
const candleInDirectionOfPrevailingTrend = require('./service/candleInTrendDir')
const paInCandleRange = require('./service/isPAInCandleRange')
// const paRetracing = require('./service/PARetracing')
const trendTerminated = require('./service/trendTerminated')
const firstWave = require('./service/firstWave')
const getImpulseWaves = require('./service/impulseWaveScan')
const getStageOne = require('./service/stageOneScan')
const getStageTwo = require('./service/stageTwoScan')
const getValidBombs = require('./service/validBombScan')

const ABBREV = 'EURUSD';
const GRAN = 'H1';
const SINCEDATE = '2019-01-01T00:00:00.000Z';
const ENDDATE = '2019-02-01T00:00:00.000Z';



(async () => {
  const candles = await getCandles(GRAN, ABBREV, SINCEDATE, ENDDATE)

  const impulseWaves = getImpulseWaves(candles, ABBREV)

  const stageOne = getStageOne(impulseWaves, candles, ABBREV)
  console.log(`stage one .. ${stageOne.length}`)

  const stageTwo = getStageTwo(stageOne, candles)
  console.log(`stage two .. ${stageTwo.length}`)

  const bombs = getValidBombs(stageTwo, candles)
  console.log(`bombs .. ${bombs.length}`)


  console.log(' --------------------------- ')
  console.log()

  bombs.forEach((bomb, i) => {
    if (i > 0) return 

    console.log(bomb)

    return 

    console.log(bomb.date)
    console.log(`high point -->  ${bomb.highPoint}`)
    console.log(`low point -->  ${bomb.lowPoint}`)

    console.log('impulse -->')
    console.log(bomb.impulseWave.height)
    console.log(bomb.impulseWave.trend)
    console.log(bomb.impulseWave.candles)

    console.log('retrace -->')
    console.log(bomb.retraceWave.height)
    console.log(bomb.retraceWave.candles)

    console.log('secondary -->')
    console.log(bomb.secondPeriodCandles)

    console.log()
    console.log()
  })

  console.log(`BOMBS .. ${bombs.length}`)

  
  return 

  candles.forEach((candle, i) => {
    if (i === 0) {
      waves.push(firstWave(candle))
      return 
    }
    
    const inRetrace = waves.length >= 2 
      ? paInCandleRange(candle,  waves[waves.length - 2].candles)
      : false 
    const currentWave = waves[waves.length - 1]
    const currentTrend = getCurrentTrend(candle, candles[i - 1])

    if (trendTerminated(candle, candles[i - 1], waves, inRetrace)) {
      /* close of wave once trend changed */
      Object.assign(currentWave, closeWave(currentWave, candle, waves, ABBREV))

      /* if wave was a retrace. Potential beginning of a bomb. Add to stage one */ 
      if (inRetrace) {
        stageOne.push(createStageOneItem(waves[waves.length - 2], currentWave))
      }
      
      /* begin new wave for new trend */ 
      waves.push({ trend: currentTrend,  date: { start: candle.date }, candles: [candle] })
    } else {
      // console.log('trend continued')
      currentWave.candles.push(candle)
    }


    /* STAGE TWO */
    stageTwo.filter((x) => x.processing)
    .forEach((x) => {
      x.secondPeriodCandles.push(candle)

      /* If PA exceeded start of impulse. Bomb no longer valid */
      if (stageProceededPoint.startOfImpulse(x, candle)) {
        x.processing = false 
        return 
      }
      
      /* If PA exceeded high point in one candle. Bomb no longer valid */ 
      if (stageProceededPoint.highPoint(x, candle)) {
        // console.log(`STAGE 2 EXCEEDED HIGH POINT .... ${x.highPoint}`)
        x.processing = false 
        return 
      }
      
      /* If candle in direction of prevailing trend. VALID BOMB */ 
      if (candleInDirectionOfPrevailingTrend(x.trend, candle)) {
        bombs.push(createBombItem(_.cloneDeep(x), candle))
        x.processing = false 
      }
    })

    /* STAGE ONE */
    stageOne.filter((x) => x.processing).forEach((x) => {
      /* If PA exceeded high point. Bomb is no longer valid */ 
      if (stageProceededPoint.highPoint(x, candle)) {
        return x.processing = false 
      }

      /* If PA exceeded start of impluse. Bomb no longer valid */ 
      if (stageProceededPoint.startOfImpulse(x, candle)) {
        x.processing = false 
        return 
      }

      /* Process to stage two if candle exceeds low point */ 
      if (stageProceededPoint.lowPoint(x, candle)) {
        stageTwo.push(
          {
            ..._.cloneDeep(x),
            secondPeriodCandles: [candle]
          })
        x.processing = false 
        return 
      }
    })
  })
})();