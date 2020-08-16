module.exports = (candle, priorCandle, impulseTrend, log = false) => {
  if (log) {
    console.log('PA RETRACING ??')
    console.log(`impulse trend .. ${impulseTrend}`)
  }

  if (impulseTrend === 'up') {
    if (candle.low <= priorCandle.low) return true 
    else return false 
  }
  else {
    if (log) {
      console.log(`candle high .. ${candle.high}`)
      console.log(candle.date)
      console.log()
      console.log(`prior candle high .. ${priorCandle.high}`)
      console.log(priorCandle.date)
      console.log()
    }

    if (candle.high >= priorCandle.high) return true 
    else return false 
  }
}