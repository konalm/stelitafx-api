module.exports = (candle, priorCandle, impulseTrend) => {
  if (impulseTrend === 'up') {
    if (candle.low <= priorCandle.low) return true 
    else return false 
  }
  else {
    if (candle.high >= priorCandle.high) return true 
    else return false 
  }
}