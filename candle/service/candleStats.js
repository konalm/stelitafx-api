exports.candleType = (candle) => {
  if (candle.close > candle.open) return 'bull'
  if (candle.close < candle.open) return 'bear'
  
  return 'neutral'
}