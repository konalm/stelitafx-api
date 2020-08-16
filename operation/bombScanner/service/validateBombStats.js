module.exports = (stats) => {
  if (stats.retraceWave.scale.height >= stats.impulseWave.scale.height) {
    console.log(stats)
    throw new Error('Retrace broke impulse wave')
  }

  if (stats.continuationWave.scale.height > stats.retraceWave.scale.height) {
    throw new Error('Continuation broke impulse wave')
  }

  if (stats.secondRetraceWave.scale.height > stats.impulseWave.scale.height) {
    throw new Error('Second retrace broke impulse wave')
  }
}