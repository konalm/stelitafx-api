// const paInCandleRange = require('./isPAInCandleRange')
const paRetracing = require('./PARetracing')
const getCurrentTrend = require('./getCurrentTrend')



module.exports = (candle, priorCandle, waves, inRetrace) => {
  /* Determine if trend was terminated based on retrace rules */
  if (waves.length >= 2 && inRetrace) {
    if (!paRetracing(candle, priorCandle, waves[waves.length - 2].trend)) {
      return true 
    }
    else return false 
  }

  /* Determine if trend was terminated based on impulse rules */ 
  const trend = getCurrentTrend(candle, priorCandle)
  const trendInPlay = waves[waves.length - 1].trend

  if (trend && trend !== trendInPlay) return true 
  else return false 
}