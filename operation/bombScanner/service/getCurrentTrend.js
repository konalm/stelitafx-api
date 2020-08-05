module.exports = (candle, priorCandle) => {
  if (candle.high > priorCandle.high && candle.low > priorCandle.low) return 'up'
  if (candle.low < priorCandle.low && candle.high > priorCandle.low) return 'down'

  /* broke high and low */
  if (candle.high > priorCandle.high && candle.low < priorCandle.low) {
    const highBrakeHeight = candle.high - priorCandle.high 
    const lowBrakeHeight = priorCandle.low - priorCandle.low 

    if (highBrakeHeight >= lowBrakeHeight) return 'up'
    else return 'down'
  }
};