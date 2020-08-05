module.exports = (progressiveCandle, haTrendGroups, haCandles) => {
  const i = haCandles.findIndex((x) => x.date.toISOString() === progressiveCandle.date)

  if (i === -1) {
    return false
  }

  const priorHACandle = haCandles[i - 1]

  const open = (priorHACandle.open + priorHACandle.close) / 2
  const close = (
    progressiveCandle.open + 
    progressiveCandle.high + 
    progressiveCandle.low + 
    progressiveCandle.close
  ) / 4
  // const high = Math.max(open, close, progressiveCandle.high)
  // const low = Math.min(open, close, progressiveCandle.low)
  const trend =  close > open ? 'up' : 'down'

  const opposingTrendGroups = haTrendGroups.filter((x) => x.trend !== trend)
  const lastOpposingTrendGroup = opposingTrendGroups[opposingTrendGroups.length - 1]
  const priorTrendFirstCandleClose = lastOpposingTrendGroup
    ? lastOpposingTrendGroup.candles[0].close
    : null 

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


  return { trend, upperTrend }
}