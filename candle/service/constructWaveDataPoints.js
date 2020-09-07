const _ = require('lodash')
const { candleType } = require('./candleStats')


module.exports = (heikenCandles) => {
  // console.log('CONSTRUCT WAVE DATA POINTS')

  const clonedCandles = _.cloneDeep(heikenCandles)
  const trendTimeline = buildTrendTimeline(heikenCandles)
  
  const waveDataPoints = [{ 
    date: heikenCandles[0].date,
    value: heikenCandles[0].close,
    candles: [heikenCandles[0]]
  }]

  trendTimeline.forEach((trend) => {
    const index = clonedCandles.findIndex((x) => 
      x.date.toISOString() === trend.endDate.toISOString()
    )
    const trendCandles = clonedCandles.splice(0, index + 1)

    const val = trend.type === 'bull' 
      ? trendCandles.reduce((a, b) => a.high > b.high ? a : b)
      : trendCandles.reduce((a, b) => a.low < b.low ? a : b)


    waveDataPoints.push({ 
      date: val.date, 
      value: trend.type === 'bull' ? val.high : val.low,
      candles: trendCandles
    })
  })

  // console.log('wave data points -->')
  // console.log(waveDataPoints[2])

  return waveDataPoints
}


/**
 *  Build timeline of trends, recording date when trend changes direction
 */
const buildTrendTimeline = (heikenCandles) => {
  const trendTimeline = []

  heikenCandles.forEach((candle, i) => {
    const type = candleType(candle)
  
    if (i > 0) {
      const priorCandle = heikenCandles[i - 1]
      const lastType = candleType(priorCandle)
  
      /* Trend complete when candle is differ direction */ 
      if (type !== lastType) {
        trendTimeline.push({ type: lastType, endDate: priorCandle.date })
        return
      }
  
      /* Complete trend if last candle */ 
      if (i == heikenCandles.length - 1) {
        trendTimeline.push({ type, endDate: candle.date })
      }
    }
  })

  return trendTimeline
}