const _ = require('lodash')
const { candleType } = require('./candleStats')
const calculatePips = require('@/services/calculatePip')
const minsBetweenDates = require('@/services/minsBetweenDatesV2')

module.exports = (dataPoints, symbol, candles) => {
  console.log('CONSTRUCT WAVES')

  console.log(dataPoints[1])

  const waves = []

  dataPoints.forEach((dataPoint, i) => {
    const { date, value } = dataPoint 

    /* End prior wave */ 
    if (i > 0) {
      let priorWave = waves[i - 1]
      priorWave.timeline.end = date
      priorWave.values.end = value
      priorWave.trend = value > priorWave.values.start ? 'up' : 'down'
      priorWave.height = getWaveHeight(priorWave.values, symbol)
      priorWave.length = getWaveLength(priorWave, symbol)
      priorWave.candles =  candles.filter((x) => 
        x.date > priorWave.timeline.start && x.date <= priorWave.timeline.end
      )
    }

    if (i < dataPoints.length - 1) {
      waves.push({
        timeline: { start: date },
        values: { start: value},
        index: i
      })
    }
  })

  console.log('waves -->')
  console.log(waves[0])
  console.log(waves[1])
  console.log(waves[2])

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