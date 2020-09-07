const calculatePip = require('../../../services/calculatePip')

module.exports = (candles) => {
  const waves = []

  candles.forEach((candle, i) => {
    const direction = getDirection(candle)

    if (i === 0) {
      waves.push({ 
        start: {
          date: candle.date,
          value: direction === 'up' ? candle.high : candle.low
        },
        end: {},
        direction,
        candles: [candle], 
        height: calculatePip(candle.low, candle.high, 'EURUSD')
      })
      return 
    }

    const wave = waves[waves.length - 1]
    const priorCandle = candles[i - 1]

    if (waveTrendChanged(wave, candle, priorCandle)) {
      const newDirection = wave.direction === 'up' ? 'down' : 'up'

      waves.push({
        direction: newDirection,
        candles: [candle],
        start: {
          date: priorCandle.date, 
          value: wave.end.value
        },
        end: {
          date: candle.date,
          value: newDirection === 'up' ? candle.high : candle.low
        },
        lowPoint: candle,
        highPoint: candle,
        benchMark: newDirection === 'up' ? candle.low : candle.high, 
        height: Math.abs(
          calculatePip(
            wave.end.value, 
            newDirection === 'up' ? candle.high : candle.low, 
            'EURUSD'
          )
        )
      })
    } else {
      wave.candles.push(candle)
      wave.end.date = candle.date
      wave.end.value = wave.direction === 'up' ? candle.high : candle.low 
      wave.lowPoint = wave.direction === 'up' 
        ? wave.candles[0] 
        : wave.candles[wave.candles.length - 1]
      wave.highPoint = wave.direction === 'up'
        ? wave.candles[wave.candles.length - 1]
        : wave.candles[0]
      wave.benchMark = wave.direction === 'up'
        ? wave.lowPoint.low
        : wave.highPoint.high 
      wave.height = Math.abs(calculatePip(
        wave.start.value, 
        wave.direction === 'up' 
          ? Math.max(...wave.candles.map((x) => x.high)) 
          // ? candle.high
          // : candle.low
          : Math.min(...wave.candles.map((x) => x.low)), 
        'EURUSD'
      ))
    }
  })

  return waves
}

const waveContracted = (candle, priorCandle) => {
  return !higherHigh(candle, priorCandle) && !lowerLow(candle, priorCandle)
}

const doubleBreakTendContinued = (wave, candle, priorCandle) => {
  if ( !(higherHigh(candle, priorCandle) && lowerLow(candle, priorCandle))) return false 

    // low or high furthest from data point */ 
    const highDistance = candle.high - wave.dataPoint
    const lowDistance = wave.dataPoint - candle.low 

    if (wave.trend === 'up') return highDistance >= lowDistance
    else return lowDistance >= highDistance
}


const waveTrendChanged = (wave, candle, priorCandle) => {
  if (wave.direction === 'up') {
    if (lowerHigh(candle, priorCandle) && lowerLow(candle,  priorCandle)) return true 
  }

  if (wave.direction === 'down') {
    if (higherHigh(candle, priorCandle) && higherLow(candle, priorCandle)) return true 
  }

  if (waveContracted(candle, priorCandle)) {
    if (getCandleDir(candle) !== wave.direction) return true 
  }

  return false
}

const getDirection = (candle) => candle.close > candle.open ? 'up' : 'down'


const higherHigh = (candle, priorCandle) => candle.high >= priorCandle.high
const higherLow = (candle, priorCandle) => candle.low >= priorCandle.low
const lowerLow = (candle, priorCandle) => candle.low <= priorCandle.low
const lowerHigh = (candle, priorCandle) => candle.high <= priorCandle.high
const getCandleDir = (candle) => {
  if (candle.close >= candle.open) return 'up'
  return 'down'
}