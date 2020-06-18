const _ = require('lodash')
const  { percentageDiff } = require('@/services/utils')

module.exports = (waves) => {
  console.log('harmonic patterns')

  const wavesCopy = _.cloneDeep(waves)

  // percentage Wave 2 retraced Wave 1
  //

  waves.forEach((wave, i) => {
    /* At least 3 waves */ 
    if (i < 3) return 
    
    const w = [...wavesCopy].splice(i - 3, 4)
    if (w[0].trend === 'up' && w[1].trend === 'down' && w[2].trend === 'up') {
      
      if (w[0].height > w[1].height) {
        const wave2Retrace = percentageDiff(w[1].height, w[0].height)
        const wave2RetraceTarget = 61.8
        const wave2RetraceTarget2 = 78.6
        const leeway = 5
        
        if (
          ( wave2Retrace > wave2RetraceTarget - leeway  && wave2Retrace < wave2RetraceTarget + leeway )
          || (wave2Retrace > wave2RetraceTarget2 - leeway && wave2Retrace < wave2RetraceTarget2 + leeway)
          ) {
            // console.log('WAVE 2 RETRACE HIT')
            // console.log(wave2Retrace)
            
            const wave3Retrace = percentageDiff(w[2].height, w[1].height) 
            const wave3RetraceTarget = 127.2
            const wave3RetraceTarget2 = 161.8 

            if (
              (wave3Retrace > wave3RetraceTarget - leeway && wave3Retrace < wave3RetraceTarget + leeway)
              || (wave3Retrace > wave3RetraceTarget2 - leeway && wave3Retrace < wave3RetraceTarget2 + leeway)
              ) {
                console.log('HIT !!!!!!!!!')
                console.log(wave3Retrace)
                console.log(wave)
            }

        }
      }
    }
  })
}