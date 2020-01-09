const wmaService = require('./wma/service')
const movingAverageService = require('./movingAverage/service')
const prototypeIni = require('./algorithms/ini')
const { TIME_INTERVALS, HOUR_INTERVALS  } = require('./config')
const { storeStochastic } = require('./stochastic/service')
const secondsBetweenDates = require('./services/secondsBetweenDates')
// const dbConnections = require('./dbConnections')

const intervalArg = process.argv.slice(2, 3)[0]
const interval = parseInt(intervalArg)

if (isNaN(interval)) return console.error('Interval must be a number')

if (!TIME_INTERVALS.includes(interval) && !HOUR_INTERVALS.includes(interval / 60)) {
  return console.error(`${interval}, is not a valid interval`)
}

// dbConnections('process interval ' + interval)

const startDate = new Date()


console.log('PROCESS INTERVAL ' + interval)


Promise.all([
  wmaService.storeWMAData(interval, 'currency_rate'),
  storeStochastic(interval)
])
  .then(() => {
    console.log('stored data :)')
    
    prototypeIni(interval)
      .then(() => {   
        console.log(`interval ${interval} .. took ${secondsBetweenDates(startDate)}`)
        // mongoose.connection.close()
        process.exit(interval)
      })
      .catch(() => {
        console.error('prototype INI FAIL !!!')
     
        process.exit(`fail for ${interval}`)
      })
  })
  .catch(e => {
    console.log(e)
    console.error('FAIL FAIL FAIL')
  })
