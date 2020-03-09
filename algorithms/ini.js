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
// const prototypeNo16 = require('./prototype#16');
// const prototypeNo71 = require('./prototype#71');
// const prototypeNo72 = require('./prototype#72');
// const prototypeNo73 = require('./prototype#73');
// const prototypeNo74 = require('./prototype#74');
const prototypeNo80 = require('./prototype#80');
const prototypeNo81 = require('./prototype#81');
// const prototypeNo82 = require('./prototype#82');
const prototypeNo83 = require('./prototype#83');
const prototypeNo85 = require('./prototype#85');
const prototypeNo86 = require('./prototype#86');
const prototypeNo87 = require('./prototype#87');
const prototypeNo88 = require('./prototype#88');
const prototypeNo89 = require('./prototype#89');
const prototypeNo90 = require('./prototype#90');
const prototypeNo91 = require('./prototype#91');
const prototypeNo92 = require('./prototype#92');
const prototypeNo93 = require('./prototype#93');
const prototypeNo94 = require('./prototype#94');
const prototypeNo95 = require('./prototype#95');
const prototypeNo96 = require('./prototype#96');
const prototypeNo97 = require('./prototype#97');
const prototypeNo101 = require('./prototype#101');
const prototypeNo102 = require('./prototype#102');
const prototypeNo103 = require('./prototype#103');
const prototypeNo104 = require('./prototype#104');
const prototypeNo105 = require('./prototype#105');


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

  runAlgorithms(timeInterval, currency, intervalCurrencyData)
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
    service.getCurrentAndPriorMacdItems(timeInterval, abbrev)
  ])
    .then(res => {
      const WMAs  = res[0]
      const movingAverages = res[1]
      const currentRate = WMAs.WMA ? WMAs.WMA.rate : null
      const stochastic = res[2]
      const macd = res[3]

      resolve({ movingAverages, WMAs, currentRate, stochastic, macd })
    })
    .catch(e => {
      console.log('FAILLLL')
      reject(e)
    })
})


const runAlgorithms = (timeInterval, currency, intervalCurrencyData) => 
  new Promise((resolve, reject) => 
{
  const conn = db()

  Promise.all([
    prototype(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo11(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo12(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo13(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo2(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo3(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo4(timeInterval, currency, intervalCurrencyData, conn), 
    prototypeNo5(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo51(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo6(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo7(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo14(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo15(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo16(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo71(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo72(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo73(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo74(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo80(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo81(timeInterval, currency, intervalCurrencyData, conn),
    // prototypeNo82(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo83(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo85(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo86(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo87(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo88(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo89(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo90(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo91(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo92(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo93(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo94(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo95(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo96(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo97(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo101(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo102(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo103(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo104(timeInterval, currency, intervalCurrencyData, conn),
    prototypeNo105(timeInterval, currency, intervalCurrencyData, conn),
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
