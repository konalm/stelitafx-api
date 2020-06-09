const _ = require('lodash')

/**
 * Detect Impulse waves 
 */
module.exports = (waves) => {
  wavesCopy = _.cloneDeep(waves)

  const impulseWaves = []

  waves.forEach((_, i) => {
    /* At least 5 waves */ 
    if ( i < 4) return 

    const priorFiveWaves = [...waves].splice(i - 4, 5)
    
    if (detectMotiveWave(priorFiveWaves)) {
      if (detectImpulse(priorFiveWaves)) {
        impulseWaves.push({
          startDate: priorFiveWaves[0].timeline.start,
          endDate: priorFiveWaves[4].timeline.end,
          waves: priorFiveWaves
        })
      }
    }
  })

  return impulseWaves
}


const labelWaves = (waves) => ({
  one: waves[0],
  two: waves[1],
  three: waves[2],
  four: waves[3],
  five: waves[4]
})


/**
 * Rule 1 -- Wave 2 retrace less than 100% of Wave 1
 * Rule 2 -- Wave 4 retrace less than 100% of Wave 3
 * Rule 3 -- Wave 3 travels beyond the end of Wave 1
 */
const detectMotiveWave = (waves) => {
  const w = labelWaves(waves)

  if (w.two.height < w.one.height) {
    if (w.four.height < w.three.height) {
       if (w.one.trend === 'up') {
         if (w.three.values.end > w.one.values.end) return true
       }
      else {
        if (w.three.values.end < w.one.values.end) return true
      }
    }
  }

  return false 
}


/**
 * Rule 1 -- Wave 4 must not overlap Wave 1
 * Rule 2 -- Wave 3 must not be the shortest wave 
 */
const detectImpulse = (waves) => {
  const w1 = waves[0]
  const w2 = waves[1]
  const w3 = waves[2]
  const w4 = waves[3]
  const w5 = waves[4]

  if (w1.trend === 'up' && w3.trend === 'up' && w5.trend === 'up') {
    if (w4.values.end >= w1.values.end) {
      if (getShortestWave(waves) !== 3) return true
    }
  }

  if (w1.trend === 'down' && w3.trend === 'down' && w5.trend === 'down') {
    if (w4.values.end <= w1.values.end) {
      if (getShortestWave(waves) !== 3) return true
    }
  }

  return false
}

const getShortestWave = (waves) => waves.findIndex((x) => 
  x.length === Math.min(...waves.map((x) => { return x.length }))
) + 1
