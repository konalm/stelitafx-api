module.exports = (trend, candle) => {
  if (trend === 'up') {
    if (candle.close > candle.open) return true 
  }

  if (trend === 'down') {
    if (candle.close < candle.open) return true 
  }

  return false
}