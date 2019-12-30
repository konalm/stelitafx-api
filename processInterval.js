const wmaService = require('./wma/service')
const movingAverageService = require('./movingAverage/service')
const prototypeIni = require('./algorithms/ini')
const { TIME_INTERVALS, HOUR_INTERVALS  } = require('./config')
const { storeStochastic } = require('./stochastic/service')
const secondsBetweenDates = require('./services/secondsBetweenDates')
// const dbConnections = require('./dbConnections')

const intervalArg = process.argv.slice(2, 3)[0]
const interval = parseInt(intervalArg)

if (isNaN(interval)) throw new Error('Interval must be a number')

if (!TIME_INTERVALS.includes(interval) && !HOUR_INTERVALS.includes(interval / 60)) {
  throw new Error(`${interval}, is not a valid interval`)
}

// dbConnections('process interval ' + interval)

const startDate = new Date()


console.log('PROCESS INTERVAL ' + interval)


Promise.all([
  wmaService.storeWMAData(interval, 'currency_rate'),
  movingAverageService.storeMovingAverageData(interval, 'currency_rate'),
  storeStochastic(interval)
])
  .then(() => {
    prototypeIni(interval)
      .then(() => {   
        console.log(`interval ${interval} .. took ${secondsBetweenDates(startDate)}`)
        // mongoose.connection.close()
        process.exit(interval)
      })
      .catch(() => {
        console.error('prototype INI FAIL !!!')
        // mongoose.connection.close()

        process.exit(`fail for ${interval}`)
      })
  })
  .catch(e => {
    console.log(e)
    console.log('FAIL FAIL FAIL')
    throw new Error(`Failed to store WMA Data points for ${interval}mins 
      time interval`
    )
  })
