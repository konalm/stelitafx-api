const _ = require('lodash')
const stageProceededPoint = require('./stageProceededPoint')

/**
 * Loop stage one bombs & verify PA has exceeded the low point & not exceeded PA
 * of the impulse wave. For Bomb to progress to stage two
 **/

module.exports = (stageOne, candles) => {
  console.log('Stage Two Scan')

  const stageTwo = []

  stageOne.forEach((stageOneItem) => {
    const relevantCandles = candles.filter((x) => 
      new Date(x.date) >= new Date(stageOneItem.retraceWave.date.end)
    )

    const secondaryPeriodCandles = []

    for (const [i, candle] of relevantCandles.entries()) {
      /* If PA exceeded high point. Bomb is no longer valid */ 
      if (stageProceededPoint.highPoint(stageOneItem, candle)) break 

      /* If PA exceeded start of impluse. Bomb no longer valid */ 
      if (stageProceededPoint.startOfImpulse(stageOneItem, candle)) break 

      /* Want collection of candles between retrace and exceeding low point */ 
      secondaryPeriodCandles.push(candle)

      /* Stage two valid if candle exceeds low point without breaching impulse PA */ 
      if (stageProceededPoint.lowPoint(stageOneItem, candle)) {
        stageTwo.push({ ...stageOneItem, secondaryPeriodCandles })
        break
      }
    }
  })

  return stageTwo 
}