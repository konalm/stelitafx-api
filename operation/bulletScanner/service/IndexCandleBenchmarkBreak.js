const calcPip = require('../../../services/calculatePip')

module.exports = (wave, priorHeight, buffer) => {
  let startPoint = wave.start.value 

  return wave.candles.findIndex((candle) => {
    const height = wave.direction === 'up'
      ? calcPip(startPoint, candle.high, 'EURUSD')
      : Math.abs(calcPip(startPoint, candle.low, 'EURUSD'))

    return  height > (priorHeight + buffer)
  })
}