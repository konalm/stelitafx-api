module.exports = (candles) => {
  const engulfedCandles = []

  candles.forEach((candle, i) => {
    const priorCandle = i > 0 ? candles[i - 1]: null 

    if (candleType(prior) === 'red' && candleType(candle) === 'green') {
      if (candleBody(current) > candleLength(prior)) {
        engulfedCandles.push(current)
      }
    }
  })

  console.log('engulfed candles >>>>')
  console.log(engulfedCandles)
}


const candleBody = candle => Math.abs(candle.close - candle.open)

const candleLength = candle => candle.high - candle.low


const candleType = candle => {
  if (candle.close > candle.open) return 'green'
  if (candle.close < candle.open) return 'red'
  return 'neutral'
}