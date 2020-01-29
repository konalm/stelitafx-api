const { spawn } = require('child_process')
const cron = require('node-cron')
const config = require('./config')
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates')
const implementStops= require('./algorithms/stopLoss')
const dbConnGarbageCollector = require('./dbConnGarbageCollector')
const algorthmStoryPipeline = require('./algorithms/storyPipeline')
const dbConnections = require('./dbConnections')


cron.schedule('* * * * *', async () => {
  const d = new Date()
  const min = d.getMinutes()

  console.log('running cron at ' + d)

  try {
    await dbConnGarbageCollector()
  } catch (e) {
    console.error(e)
  }

  try {
    await insertCurrencyRates(d)
  } catch (err) {
    console.log(err)

    // throw new Error('Error inserting currency rates')
  }

  console.log('insert currency rates at: ' + new Date())
 
  try {
    await implementStops()
  } catch (e) {
    console.error(`Failed to implement stop losses: ${e}`)
  }

  console.log('implemented stops at: ' + new Date())


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

// const d = new Date()
// insertCurrencyRates(d)

