module.exports = (candles) => {
  console.log('construct trends V3')

  const trendTimeline = []

  candles.forEach((candle, i) => {
    if (i === 0) {
      trendTimeline.push({
        trend: candle.dir,
        timeline: { start: candle.date, end: null }
      })
      return 
    }

    const lastTrendTimeline = trendTimeline[trendTimeline.length - 1]
    if (lastTrendTimeline.trend !== candle.upperTrend) {
      lastTrendTimeline.timeline.end = candle.date 
      trendTimeline.push({
        trend: candle.dir,
        timeline: { start: candle.date, end: null }
      })
    }

    /* last candle? close timeline */
    if (i === candles.length - 1) lastTrendTimeline.timeline.end = candle.date
  })

  return trendTimeline
}
