console.log('process interval file !!!')

const wmaService = require('./wma/service')
const prototypeIni = require('./algorithms/ini')
const { TIME_INTERVALS } = require('./config')
const { storeStochastic } = require('./stochastic/service')

const currencyRateSource = [
  'currency_rate',
  // 'fixerio_currency_rate'
]

const intervalArg = process.argv.slice(2, 3)[0];
const interval = parseInt(intervalArg)

if (isNaN(interval)) throw new Error('Interval must be a number')

if (!TIME_INTERVALS.includes(interval)) throw new Error(`${interval}, is not a valid interval`)


const startDate = new Date()

console.log(`PROCESS INTERVAL ... ${interval}`)


Promise.all([
  wmaService.storeWMAData(interval, 'currency_rate'),
  storeStochastic(interval)
])
  .then(() => {
    console.log('THEN >> store wma, store stochastic COMPLETE')

    currencyRateSource.forEach((src) => {
      prototypeIni(interval, src)
        .then(() => {
          const endDate = new Date()
          const diff = endDate.getTime() - startDate.getTime()
          const secondsDiff = diff / 1000
          console.log(`interval ${interval} process took ${secondsDiff}`)
          process.exit(interval)
        })
        .catch(() => {
          console.error('protype INI FAIL !!!')
          process.exit(`fail for ${interval}`)
        })
    })
  })
  .catch(e => {
    console.log(e)
    console.log('FAIL FAIL FAIL')
    throw new Error(`Failed to store WMA Data points for ${interval}mins 
      time interval`
    )
  })
