module.exports = (candles) => {
  const waves = []

  candles.forEach((candle, i) => {
    // if (i > 20) process.exit()

    // console.log(`candle .. ${candle.date}`)

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
      })
      return 
    }

    const wave = waves[waves.length - 1]
    const priorCandle = candles[i - 1]

    if (waveTrendChanged(wave, candle, priorCandle)) {
      // console.log('CHANGED')

      const newDirection = wave.direction === 'up' ? 'down' : 'up'
      // console.log(`new direction .. ${newDirection}`)

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
        }
      })
    } else {
      // console.log('DID NOT CHANGE')
      // if (getWaveContinued(wave, candle, priorCandle)) {
        wave.candles.push(candle)
        wave.end.date = candle.date
        wave.end.value = wave.direction === 'up' ? candle.high : candle.low 
     
      // }
    }

    // console.log()
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


const getWaveContinued = (wave, candle, priorCandle) => {
  if (wave.direction === 'up') {
    if (higherHigh(candle, priorCandle) && higherLow(candle, priorCandle)) return true 
  }

  if (wave.direction === 'down') {
    if (lowerLow(candle, priorCandle) && lowerHigh(candle, priorCandle)) return true 
  }

  return doubleBreakTendContinued(wave, candle, priorCandle)
}


const waveTrendChanged = (wave, candle, priorCandle) => {
  // console.log('wave trend changed ??')

  if (wave.direction === 'up') {
    // console.log('wave direction UP')
    // console.log(`lower high .. ${lowerHigh(candle, priorCandle) }`)
    // console.log(`lower low .. ${lowerLow(candle, priorCandle) }`)
    if (lowerHigh(candle, priorCandle) && lowerLow(candle,  priorCandle)) return true 
  }

  if (wave.direction === 'down') {
    // console.log('wave direction DOWN')
    if (higherHigh(candle, priorCandle) && higherLow(candle, priorCandle)) return true 
  }

  return waveContracted(candle, priorCandle)
}

const getDirection = (candle) => candle.close > candle.open ? 'up' : 'down'


const higherHigh = (candle, priorCandle) => candle.high >= priorCandle.high
const higherLow = (candle, priorCandle) => candle.low >= priorCandle.low
const lowerLow = (candle, priorCandle) => candle.low <= priorCandle.low
const lowerHigh = (candle, priorCandle) => candle.high <= priorCandle.high