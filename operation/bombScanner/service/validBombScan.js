const stageProceededPoint = require('./stageProceededPoint');
const candleInDirectionOfPrevailingTrend = require('./candleInTrendDir')

module.exports = (stageTwo, candles) => {
  const bombs = []

  stageTwo.forEach((stageTwoItem) => {
    const stageTwoEndPeriod = stageTwoItem.secondRetraceWave.candles[
      stageTwoItem.secondRetraceWave.candles.length - 1
    ].date

    const relevantCandles = candles.filter((x) =>new Date(x.date) > new Date(stageTwoEndPeriod))

    const trendAlignedWaveCandles = []
    for (const [i, candle] of relevantCandles.entries()) {
       /* If PA exceeded start of impulse. Bomb no longer valid */
       if (stageProceededPoint.startOfImpulse(stageTwoItem, candle)) break
      
      /* If PA exceeded high point. Bomb no longer valid */ 
      if (stageProceededPoint.highPoint(stageTwoItem, candle)) break

      trendAlignedWaveCandles.push(candle)

      /* If candle in direction of prevailing trend. VALID BOMB */ 
      if (candleInDirectionOfPrevailingTrend(stageTwoItem.trend, candle)) {
        const secondLowPoint = getLowPoint(
          stageTwoItem.trend, 
          [ 
            stageTwoItem.retraceWave.candles[stageTwoItem.retraceWave.candles.length - 1],
            ...trendAlignedWaveCandles
          ]
        );

        bombs.push({
          ...stageTwoItem,
          date: { start: stageTwoItem.impulseWave.date.start, end: candle.date },
          trendAlignedWave:{
            date: {
              start: trendAlignedWaveCandles[0].date,
              end: trendAlignedWaveCandles[trendAlignedWaveCandles.length - 1].date
            },
            candles: trendAlignedWaveCandles
          } ,
          secondLowPoint
        })
        break
      }
    }
  })

  return bombs
}

const getLowPoint = (trend, candles) => {
  if (trend === 'up') return candles.reduce((a, b) => a.low < b.low ? a : b, 0).low 

  return candles.reduce((a, b) => a.high > b.high ? a : b, 0).high
}