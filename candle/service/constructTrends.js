module.exports = (waves) => {
  console.log('construct trades')

  const trends = []

  waves.forEach((wave, i) => {
    if (i === 0) return 

    const priorWave = waves[i - 1]
    const higherHigh = getHigherHigh(priorWave.second, wave.second)
    const higherLow = getHigherLow(priorWave.second, wave.second)

    const lastTrend = trends.length ? trends[trends.length - 1] : null

    let trend 
    if (higherHigh && higherLow) trend = 'up'
    else if (!higherHigh && !higherLow) trend = 'down'
    // else trend = 'congestion'

    if (!lastTrend) {
      trends.push({
        trend,
        timeline: { start: wave.first.timeline.start }
      })

      return 
    }

    if (trend !== lastTrend.trend) {
      lastTrend.timeline.end = wave.first.timeline.start 

      const newTrend = {
        trend,
        timeline: { start: wave.first.timeline.start }
      }

      // if (trend === 'congestion') {
      //   newTrend.ceiling = getHighPoint(priorWave.second)
      //   newTrend.floor = getLowPoint(priorWave.second)
      // }

      trends.push(newTrend)
    }

    if (i === waves.length - 1) lastTrend.timeline.end = wave.first.timeline.end

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