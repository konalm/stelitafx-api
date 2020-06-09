const _ = require('lodash')
const { candleType } = require('./candleStats')
const calculatePips = require('@/services/calculatePip')
const minsBetweenDates = require('@/services/minsBetweenDatesV2')

module.exports = (dataPoints, symbol) => {
  console.log('construct waves service')
  console.log(dataPoints.length)

  const waves = []

  dataPoints.forEach((dataPoint, i) => {
    const { date, value } = dataPoint 

    /* end prior wave */ 
    if (i > 0) {
      let priorWave = waves[i - 1]
      priorWave.timeline.end = date
      priorWave.values.end = value
      priorWave.trend = value > priorWave.values.start ? 'up' : 'down'
      priorWave.height = getWaveHeight(priorWave.values, symbol)
      priorWave.length = getWaveLength(priorWave, symbol)
    }

    if (i < dataPoints.length - 1) {
      waves.push({
        timeline: { start: date },
        values: { start: value},
        index: i
      })
    }
  })

  return waves
}


const getWaveLength = (wave, symbol) => {
  const height = getWaveHeight(wave.values, symbol)
  const mins = minsBetweenDates(wave.timeline.start, wave.timeline.end)
  const width = mins * 0.5
 
  return Math.sqrt((width * width) + (height * height))
} 


const getWaveHeight = (values, symbol) =>  {
  return Math.abs(calculatePips(values.start, values.end, symbol))
}