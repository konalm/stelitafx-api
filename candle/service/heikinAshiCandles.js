module.exports = (candles) => {
  const sortedCandles = candles.sort((a, b) => new Date(a.date) - new Date(b.date))

  const heikenCandles = []
  sortedCandles.forEach((candle, i) => {

    if (i === 0) {
      heikenCandles.push(candle)
      return 
    } 

    const priorHACandle = heikenCandles[heikenCandles.length - 1]
    
    const open = (priorHACandle.open + priorHACandle.close) / 2
    const close = (candle.open + candle.high + candle.low + candle.close) / 4
    const high = Math.max(open, close, candle.high)
    const low = Math.min(open, close, candle.low)

    heikenCandles.push({ date: candle.date, open, close, high, low })
  })

  return heikenCandles
}