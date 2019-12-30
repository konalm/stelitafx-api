const { spawn } = require('child_process')
const cron = require('node-cron')
const config = require('./config')
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates')
const implementStopLosses = require('./algorithms/stopLoss')
const dbConnGarbageCollector = require('./dbConnGarbageCollector')
const algorthmStoryPipeline = require('./algorithms/storyPipeline')
const dbConnections = require('./dbConnections')


cron.schedule('* * * * *', async () => {
  await dbConnGarbageCollector()
  // await dbConnections('BEGINNING OF CRON')

  try {
    await insertCurrencyRates()
  } catch (err) {
    throw new Error('Error inserting currency rates')
  }
 
  try {
    await implementStopLosses()
  } catch (e) {
    throw new Error('Failed to implement stop losses')
  }

  const d = new Date()
  const min = d.getMinutes()

  console.log('min ... ' + min)

  const intervalsToRun = []
  config.TIME_INTERVALS.forEach((timeInterval) => {
    if (min % timeInterval === 0) intervalsToRun.push(timeInterval)
  })

  algorthmStoryPipeline(1)

  let intervalsComplete = 0
  intervalsToRun.forEach((interval) => {
    const spawnedProcess = spawn('node', ['processInterval', interval])

    spawnedProcess.stdout.on('data', (data) => { console.log(data.toString()) })

    // spawnedProcess.on('close', async () => {
    //   intervalsComplete ++

    //   if (intervalsComplete === intervalsToRun.length) await dbConnGarbageCollector()
    // })
  })

  if (min === 0) {
    const hour = d.getHours()
    const hourIntervalsToRun = []
    config.HOUR_INTERVALS.forEach((interval) => {
      if (hour % interval === 0) hourIntervalsToRun.push(interval)
    })
    
    hourIntervalsToRun.forEach((hourInterval) => {
      const minInterval = hourInterval * 60
      const spawnedProcess = spawn('node', ['processInterval', minInterval])

      spawnedProcess.stdout.on('data', (data) => { console.log(data.toString()) })
    })
  }
})


cron.schedule('*/5 * * * *', async () => {
  require('./oandaTransactionCacher')()
})



// cron.schedule('*/15 * * * *', async () => {
//   const sp = spawn('node', ['bidAskSpread'])
//   sp.stdout.on('data', (data) => {
//     console.log(data.toString())
//   })
//   sp.on('close', async () => {
//     console.log('insert bid ask spread')
//   })
// })



// dbConnGarbageCollector()



