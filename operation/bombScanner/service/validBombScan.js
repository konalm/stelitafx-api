const createBombItem = require('./createBombItem')
const stageProceededPoint = require('./stageProceededPoint');
const candleInDirectionOfPrevailingTrend = require('./candleInTrendDir')

module.exports = (stageTwo, candles) => {
  const bombs = []

  stageTwo.forEach((stageTwoItem) => {
    const secondaryPeriodCandles = stageTwoItem.secondaryPeriodCandles
    const stageTwoEndPeriod = secondaryPeriodCandles[secondaryPeriodCandles.length - 1].date

    const relevantCandles = candles.filter((x) =>
      new Date(x.date) > new Date(stageTwoEndPeriod)
    )

    for (const [i, candle] of relevantCandles.entries()) {
       /* If PA exceeded start of impulse. Bomb no longer valid */
       if (stageProceededPoint.startOfImpulse(stageTwoItem, candle)) break
      
      /* If PA exceeded high point. Bomb no longer valid */ 
      if (stageProceededPoint.highPoint(stageTwoItem, candle)) break

      /* If candle in direction of prevailing trend. VALID BOMB */ 
      if (candleInDirectionOfPrevailingTrend(stageTwoItem.trend, candle)) {
        bombs.push(createBombItem(stageTwoItem, candle))
        break
      }
    }
  })

  return bombs
}