const utils = require('./utils')
const appUtils = require('@/services/utils')
const calculatePips = require('@/services/calculatePip')
const { percentageOf } = require('@/services/utils')
const measureWaveHeight = require('./measureWaveHeight')


module.exports = (bomb, abbrev) => {
  const allCandles = getAllCandles(bomb, abbrev)
  const trend = bomb.impulseWave.trend 
  const retraceTrend = trend === 'up' ? 'down' : 'up'
  const continuationWaveStats = getWaveStats(bomb.continuationWave.candles, trend, abbrev)
  const secondRetraceWaveStats = getWaveStats(bomb.secondRetraceWave.candles, retraceTrend, abbrev)

  return {
    general: {
      ...getWaveStats(allCandles, trend, abbrev),
      date: {
        start: bomb.date.start, 
        end: bomb.date.end
      }
    },
    impulseWave:{
      ...getWaveStats(bomb.impulseWave.candles, trend, abbrev),
      lastImpulseWick: getLastImpulseWick(bomb.impulseWave, abbrev)
    },
    retraceWave: {
      ...getWaveStats(bomb.retraceWave.candles, retraceTrend, abbrev),
      retracePercent: percentageOf(bomb.impulseWave.height, bomb.retraceWave.height)
    },
    continuationWave: {
      ...continuationWaveStats,
      percentToRetrace: percentageOf(bomb.retraceWave.height, continuationWaveStats.scale.height, abbrev),
      percentToImpulse: percentageOf(bomb.impulseWave.height, continuationWaveStats.scale.height, abbrev)
    },
    secondRetraceWave: {
      ...secondRetraceWaveStats,
      percentToRetrace: percentageOf(bomb.retraceWave.height, secondRetraceWaveStats.scale.height, abbrev),
      percentToImpulse: percentageOf(bomb.impulseWave.height, secondRetraceWaveStats.scale.height, abbrev)
    },
    trendAlignedWave: getWaveStats(bomb.trendAlignedWave.candles, trend, abbrev)
  }
}


const getLastImpulseWick = (impulseWave, abbrev) => {
  const candle = impulseWave.candles[impulseWave.candles.length - 1]

  if (impulseWave.trend === 'up') {
    return Math.abs(calculatePips(candle.high, candle.close, abbrev))
  }
  else {
    return Math.abs(calculatePips(candle.low, candle.close, abbrev))
  }
}


const getWaveStats = (candles, trend, abbrev) => ({
  candles: candles.length,
  scale: getScale(trend, candles, abbrev),
  transactionPressure: getTransactionPressure(candles),
  wicky: getWickPercent(candles)
})

const getWickPercent = (candles) => candles.reduce((wickPercent, x) => {
  const length = x.high - x.low 
  const body = Math.abs(x.open - x.close)

  return wickPercent + percentageOf(length, length - body)
}, 0) / candles.length


const getScale = (trend, candles, abbrev) => {
  return {
    width: getWaveWidth(candles.length),
    height: measureWaveHeight(trend, candles, abbrev),
    length: getWaveLength(candles, abbrev)
  }
}


const getWaveWidth = (candlesAmount) => candlesAmount * 5


const getWaveHeight = (candles, abbrev) =>  {
  const lowestLow = utils.getLowestLow(candles)
  const highestHigh = utils.getHighestHigh(candles)

  return calculatePips(lowestLow, highestHigh, abbrev)
}


const getWaveLength = (candles, abbrev) => {
  const width = getWaveWidth(candles.length)
  const height = getWaveHeight(candles, abbrev)
 
  return Math.sqrt((width * width) + (height * height))
} 


const getAllCandles = (bomb) => {
  return [
    ...bomb.impulseWave.candles,
    ...bomb.retraceWave.candles,
    ...bomb.continuationWave.candles,
    ...bomb.secondRetraceWave.candles,
    ...bomb.trendAlignedWave.candles
  ]
} 

const getTransactionPressure = (candles) => {
  const bullPressure = candles
    .filter((x) => x.close > x.open)
    .reduce((sum, x) => sum + (x.close - x.open), 0)

  const bearPressure = candles
    .filter((x) => x.close < x.open)
    .reduce((sum, x) => sum + (x.open - x.close), 0)
  
  const totalPressure = bullPressure + bearPressure

  return {
    bull: appUtils.percentageOf(totalPressure, bullPressure),
    bear: appUtils.percentageOf(totalPressure, bearPressure)
  }  
}
