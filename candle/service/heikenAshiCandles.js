module.exports = (candles) => {
  const sortedCandles = candles.sort((a, b) => new Date(a.date) - new Date(b.date))

  const heikenGroups = []

  const heikenCandles = []
  sortedCandles.forEach((candle, i) => {
    if (i === 0) {
      const heikenCandle = {...candle, rate: candle.close}
      heikenCandles.push(heikenCandle)
      heikenGroups.push({
        trend: candle.close > candle.open ? 'up' : 'down',
        candles: [heikenCandle]
      })

      return 
    } 
    
    const priorHACandle = heikenCandles[heikenCandles.length - 1]
    
    const open = (priorHACandle.open + priorHACandle.close) / 2
    const close = (candle.open + candle.high + candle.low + candle.close) / 4
    const high = Math.max(open, close, candle.high)
    const low = Math.min(open, close, candle.low)
    const trend =  close > open ? 'up' : 'down'

    const heikenCandle = { 
      date: candle.date, 
      open, 
      close,
      high, 
      low,
      rate: candle.close,
      trend
    }

    heikenCandles.push(heikenCandle)

    const lastGroup = heikenGroups[heikenGroups.length - 1]
    const lastGroupTrend = lastGroup.trend
    if (trend === lastGroupTrend) {
      lastGroup.candles.push(heikenCandle)
    } else {
      heikenGroups.push({
        trend,
        candles: [heikenCandle]
      })
    }

    const opposingTrendGroups = heikenGroups.filter((x) => x.trend !== trend)
    const lastOpposingTrendGroup = opposingTrendGroups[opposingTrendGroups.length - 1]
  
    const priorTrendFirstCandleClose = lastOpposingTrendGroup
      ? lastOpposingTrendGroup.candles[0].close
      :null 
    
    let upperTrend
    if (priorTrendFirstCandleClose) {
      if (trend === 'up') {
        if (open > priorTrendFirstCandleClose) upperTrend = 'up'
        else upperTrend = 'down'
      }
      else {
        if (open < priorTrendFirstCandleClose) upperTrend = 'down'
        else upperTrend = 'up'
      }
    } else upperTrend = trend


    heikenCandle.upperTrend = upperTrend
  })

  return heikenCandles
}