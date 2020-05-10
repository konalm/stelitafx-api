require('module-alias/register')

const wmaService = require('./wma/service')
const prototypeIni = require('./algorithms/ini')
const { TIME_INTERVALS, HOUR_INTERVALS  } = require('./config')
const { storeStochastic } = require('./stochastic/service')
const { storeVolatility } = require('./volatility/service')
const secsFromDate = require('./services/secondsBetweenDates')
const storeMacd = require('@/indicators/macd/service/storeMacdForInterval')
const storeAdx = require('@/indicators/adx/service/storeAdx')
const secondsBetweenDates = require('@/services/secondsBetweenDates')

const intervalArg = process.argv.slice(2, 3)[0]
const interval = parseInt(intervalArg)

const strategyPipeline = require('@/strategy/pipeline')

if (isNaN(interval)) return console.error('Interval must be a number')

if (!TIME_INTERVALS.includes(interval) && !HOUR_INTERVALS.includes(interval / 60)) {
  return console.error(`${interval}, is not a valid interval`)
}

let sDate = new Date()


Promise.all([
  wmaService.storeWMAData(interval),
  storeStochastic(interval),
  storeMacd(interval),
  storeAdx(interval)
])
  .then(() => {
    // console.log( secondsBetweenDates(sDate) )

    // prototypeIni(interval)
    //   .then(() => {   
    //     console.log(`PROCESS INTERVAL ${interval} .. took ${secsFromDate(sDate)}`)
    //     process.exit(interval)
    //   })
    //   .catch(() => {
    //     console.error('prototype INI FAIL !!!')
     
    //     process.exit(`fail for ${interval}`)
    //   })



    strategyPipeline(interval)
      .then((res) => {
        console.log(`PROCESS INTERVAL ${interval} .. took ${secsFromDate(sDate)}`)
        process.exit(interval)
      })
      .catch((e) =>  {
        console.log('CATCH')
        console.log(e)
      })
  })
  .catch(e => {
    console.log(e)
    console.error('FAIL FAIL FAIL')
  })
