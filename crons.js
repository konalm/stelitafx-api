const { spawn } = require('child_process');
const cron = require('node-cron')
const config = require('./config')
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates');


cron.schedule('* * * * *', async () => {
  // console.log('CRON SCHEDULE !!')

  try {
    await insertCurrencyRates()
  } catch (err) {
    throw new Error('Error inserting currency rates')
  }

  console.log('inserted currency rate !!')

  const d = new Date()
  const min = d.getMinutes()

  // const spawnedProcess = spawn('node', ['processInterval', 1])
  // spawnedProcess.stdout.on('data', (data) => {
  //   console.log(data.toString())
  // })

  config.TIME_INTERVALS.forEach((timeInterval) => {
    if (min % timeInterval === 0) {
      const spawnedProcess = spawn('node', ['processInterval', timeInterval])
      spawnedProcess.stdout.on('data', (data) => {
        console.log(data.toString())
      })
      spawnedProcess.on('close', (interval) => {
        // console.log(`spawned process complete for time interval ${interval}`)
      })
    }
  })
})



// const spawnedProcess = spawn('node', ['processInterval', 1])
// spawnedProcess.stdout.on('data', (data) => {
//   console.log(data.toString())
// })