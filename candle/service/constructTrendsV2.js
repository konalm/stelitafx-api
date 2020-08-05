module.exports = (waves) => {
  console.log('construct trades')

  const trends = []

  console.log(waves[0])

  waves.forEach((wave, i) => {
    if (i === 0) {
      trends.push({ 
        trend: wave.trend, 
        timeline: { start: wave.timeline.start }
      })

      return 
    }

    const priorWave = waves[i - 1]
    const lastTrend = trends[trends.length - 1]

    if (wave.trend !== lastTrend.trend) {
      if (wave.height > priorWave.height) {
        lastTrend.timeline.end = wave.timeline.start
        trends.push({
          trend: wave.trend, 
          timeline: { start: wave.timeline.start }
        })
      }
    }

    if (i === waves.length - 1)  {
      if (wave.trend === lastTrend.trend) lastTrend.timeline.end = wave.timeline.end
      else {
        lastTrend.timeline.end = wave.timeline.start
        trends.push({
          trend: wave.trend, 
          timeline: { start: wave.timeline.start, end: wave.timeline.end }
        })
      }
    }
  })

  return trends 
}

const getHigherHigh = (prior, current) => {
  const priorHigh = getHighPoint(prior)
  const currentHigh = getHighPoint(current)

  return currentHigh > priorHigh 
}

const getHigherLow = (prior, current) => {
  const priorLow = getLowPoint(prior)
  const currentLow = getLowPoint(current)

  return currentLow > priorLow
}

const getHighPoint = (wave) => {
  return Math.max(wave.values.start, wave.values.end)
}

const getLowPoint = (wave) => {
  return Math.min(wave.values.start, wave.values.end)
}