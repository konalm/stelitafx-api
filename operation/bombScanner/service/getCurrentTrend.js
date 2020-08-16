module.exports = (candle, priorCandle) => {
  // if (candle.date === '2019-01-08T00:00:00.000Z') {
  //   console.log('Observing 00:00')

  //   if (candle.low < priorCandle.low) {
  //     console.log('Lower Low')
  //   }

  //   console.log(candle.high)
  //   console.log(priorCandle.high)
  // }




  if (candle.high > priorCandle.high && candle.low >= priorCandle.low) return 'up'
  if (candle.low < priorCandle.low && candle.high <= priorCandle.high) return 'down'

  /* broke high and low */
  if (candle.high > priorCandle.high && candle.low < priorCandle.low) {
    
    const highBrakeHeight = candle.high - priorCandle.high 
    const lowBrakeHeight = priorCandle.low - candle.low 

    // if (candle.date === '2019-01-08T00:00:00.000Z') {
    //   console.log(`broke both sides`)

    //   console.log(`high break .. ${highBrakeHeight}`)
    //   console.log(`low break .. ${lowBrakeHeight}`)
    // }

    if (highBrakeHeight >= lowBrakeHeight) return 'up'
    else return 'down'
  }
};