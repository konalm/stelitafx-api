const service = require('./service');
const db = require('../dbInstance')

const prototype = require('./prototype');
const prototypeNo11 = require('./prototype#11');
const prototypeNo12 = require('./prototype#12');
const prototypeNo13 = require('./prototype#13');
// const prototypeNo2 = require('./prototype#2');
// const prototypeNo3 = require('./prototype#3');
// const prototypeNo4 = require('./prototype#4');
const prototypeNo5 = require('./prototype#5');
// const prototypeNo51 = require('./prototype#51');
// const prototypeNo6 = require('./prototype#6');
const prototypeNo7 = require('./prototype#7');
const prototypeNo14 = require('./prototype#14');
const prototypeNo15 = require('./prototype#15');
const prototypeNo16 = require('./prototype#16');
// const prototypeNo71 = require('./prototype#71');
// const prototypeNo72 = require('./prototype#72');
// const prototypeNo73 = require('./prototype#73');
// const prototypeNo74 = require('./prototype#74');
const prototypeNo80 = require('./prototype#80');
const prototypeNo81 = require('./prototype#81');
const prototypeNo82 = require('./prototype#82');
const prototypeNo83 = require('./prototype#83');
const prototypeNo85 = require('./prototype#85');
const prototypeNo86 = require('./prototype#86');
const prototypeNo87 = require('./prototype#87');
const prototypeNo88 = require('./prototype#88');

const config = require('../config');
const majorCurrencies = config.MAJOR_CURRENCIES



module.exports = (timeInterval, currencyRateSrc) => new Promise(async(resolve, _) => {
  const intervalCurrencyPromises = []

  majorCurrencies.forEach((currency) => {
    intervalCurrencyPromises.push(
      intervalCurrencyAlgorithm(timeInterval, currency, currencyRateSrc)
    )
  })

 Promise.all(intervalCurrencyPromises)
  .then(() => {
    resolve()
  })
  .catch((e) => {
    console.log(e)
    console.log('FAILED')
    resolve()
  })
})


const intervalCurrencyAlgorithm = (timeInterval, currency, currencyRateSrc) => 
  new Promise(async (resolve, reject) => 
{
  const s = new Date()

  let intervalCurrencyData 
  try {
    intervalCurrencyData = await dataRelevantToIntervalCurrency(
      timeInterval, 
      currency,
      currencyRateSrc
    )
  } catch (e) {
    console.log(e)
    console.log('failed to get interval currency data')
    return reject('Failed to get interval currency data')
  }

  runAlgorithms(timeInterval, currency, currencyRateSrc, intervalCurrencyData)
    .then(() => {
      resolve()
    })
    .catch((e) => {
      console.log(e)
      console.log('Failed to run algos')
      reject()
    })
})


const dataRelevantToIntervalCurrency = (timeInterval, currency, currencyRateSrc) => 
  new Promise(async (resolve, reject) => 
{
  const abbrev = `${currency}/USD`

  Promise.all([
    service.getCurrentAndPrevWMAs(abbrev, timeInterval, currencyRateSrc),  
    service.getMovingAverages(abbrev, timeInterval, currencyRateSrc),
    service.getCurrentAndPrevStochastic(abbrev, timeInterval),
  ])
    .then(res => {
      const WMAs  = res[0]
      const movingAverages = res[1]
      const currentRate = WMAs.WMA ? WMAs.WMA.rate : null
      const stochastic = res[2]
 
      resolve({ movingAverages, WMAs, currentRate, stochastic })
    })
    .catch(e => {
      console.log('FAILLLL')
      reject(e)
    })
})


const runAlgorithms = (timeInterval, currency, currencyRateSrc,  intervalCurrencyData) => 
  new Promise((resolve, reject) => 
{
  // console.log('interval currency data >>')
  // console.log(intervalCurrencyData)

  const conn = db()
  Promise.all([
    prototype(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo11(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo12(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo13(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo2(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo3(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo4(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn), 
    prototypeNo5(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo51(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo6(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo7(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo14(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo15(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo16(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo71(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo72(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo73(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    // prototypeNo74(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo80(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo81(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo82(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo83(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo85(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo86(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo87(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn),
    prototypeNo88(timeInterval, currency, currencyRateSrc, intervalCurrencyData, conn)
  ])
    .then(() => {
      conn.end()
      resolve()
    })
    .catch((e) => {
      conn.end()
      console.log(e)
      console.log('CATCH')
      reject()
    })
})
