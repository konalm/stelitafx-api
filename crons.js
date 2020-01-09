const { spawn } = require('child_process')
const cron = require('node-cron')
const config = require('./config')
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates')
const implementStopLosses = require('./algorithms/stopLoss')
const dbConnGarbageCollector = require('./dbConnGarbageCollector')
const algorthmStoryPipeline = require('./algorithms/storyPipeline')
const dbConnections = require('./dbConnections')


cron.schedule('* * * * *', async () => {


  console.log('cron schedule ?')

  try {
    await dbConnGarbageCollector()
  } catch (e) {
    console.error(e)
  }
  // await dbConnections('BEGINNING OF CRON')

  try {
    await insertCurrencyRates()
  } catch (err) {
    throw new Error('Error inserting currency rates')
  }
 
  try {
    await implementStopLosses()
  } catch (e) {
    console.error('Failed to implement stop losses')
  }

  console.log('IMPLEMENT STOP LOSSES COMPLETE')

  const d = new Date()
  const min = d.getMinutes()

  console.log('min ... ' + min)

  const intervalsToRun = []
  config.TIME_INTERVALS.forEach((timeInterval) => {
    if (min % timeInterval === 0) intervalsToRun.push(timeInterval)
  })

  // algorthmStoryPipeline(1)

  console.log(`intervals to run ... ${intervalsToRun.length}`)

  let intervalsComplete = 0
  intervalsToRun.forEach((interval) => {
    const spawnedProcess = spawn('node', ['processInterval', interval])

    spawnedProcess.stdout.on('data', (data) => { console.log(data.toString()) })
  })

  // if (min === 0) {
  //   const hour = d.getHours()
  //   const hourIntervalsToRun = []
  //   config.HOUR_INTERVALS.forEach((interval) => {
  //     if (hour % interval === 0) hourIntervalsToRun.push(interval)
  //   })
    
  //   hourIntervalsToRun.forEach((hourInterval) => {
  //     const minInterval = hourInterval * 60
  //     const spawnedProcess = spawn('node', ['processInterval', minInterval])

  //     spawnedProcess.stdout.on('data', (data) => { console.log(data.toString()) })
  //   })
  // }
})

const ini = async () => {
  console.log('INI')

  try {
    await implementStopLosses()
  } catch (e) {

    return console.error('Failed to implement stop losses')
  }
}
// ini()



// cron.schedule('*/5 * * * *', async () => {
//   require('./oandaTransactionCacher')()
// })



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



