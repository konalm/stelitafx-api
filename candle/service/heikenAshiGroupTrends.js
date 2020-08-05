module.exports = (haCandles) => {
  const groups = []

  haCandles.forEach((haCandle, i) => {
    if (i === 0) {
      groups.push({ 
        trend: haCandle.trend, 
        candles: [haCandle],
        date: { start: haCandle.date }
      })
      return 
    }

    const lastGroup = groups[groups.length - 1]

    if (haCandle.trend === lastGroup.trend) lastGroup.candles.push(haCandle)
    else {
      lastGroup.date.end = haCandle.date 
      groups.push({ 
        trend: haCandle.trend, 
        candles: [haCandle], 
        date: { start: haCandle.date} 
      })
    }
  })

  return groups
}