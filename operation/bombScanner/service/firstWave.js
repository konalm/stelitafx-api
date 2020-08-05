module.exports = (candle) => { 
  return {
    trend: candle.open > candle.close ? 'up' : 'down',
    date: { start: candle.date },
    candles: [candle]
  }
}