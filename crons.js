const { spawn } = require('child_process')
const cron = require('node-cron')
const config = require('./config')
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates')
const implementStops= require('./algorithms/stopLoss')
const dbConnGarbageCollector = require('./dbConnGarbageCollector')
const algorthmStoryPipeline = require('./algorithms/storyPipeline')
const dbConnections = require('./dbConnections')
const uploadHistoricTrades = require('./xtb/services/uploadHistoricTrades')


cron.schedule('* * * * *', async () => {
  const d = new Date()
  const min = d.getMinutes()

  try {
    await dbConnGarbageCollector()
  } catch (e) {
    console.error(e)
  }

  console.log('db conn garbage collector ran')

  try {
    await insertCurrencyRates(d)
  } catch (err) {
    console.log(err)
  }

 
  try {
    await implementStops()
  } catch (e) {
    console.error(`Failed to implement stop losses: ${e}`)
  }

  const intervalsToRun = []
  config.TIME_INTERVALS.forEach((timeInterval) => {
    if (min % timeInterval === 0) intervalsToRun.push(timeInterval)
  })


  console.log(`intervals to run ... ${intervalsToRun.length}`)

  let intervalsComplete = 0
  intervalsToRun.forEach((interval) => {
    const spawnedProcess = spawn('node', ['processInterval', interval])

    spawnedProcess.stdout.on('data', (data) => { console.log(data.toString()) })
  })
})


// uploadHistoricTrades()

