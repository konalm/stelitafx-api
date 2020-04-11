require('module-alias/register');

const calcWmaInBatch = require('@/indicators/wma/service/calcWmaInBatch');
const calcStochasticInBatch = require('@/indicators/stochastic/service/calcStochasticInBatch');
const calcAdxInBatch = require('@/indicators/adx/service/calcAdxInBatch');
const calcObcInBatch = require('@/indicators/onBalanceVolume/service/calculateInBatch');
const utils = require('@/services/utils');
const { workerData, parentPort } = require('worker_threads');
const { date, periods } = workerData;


const log = (mes) => parentPort.postMessage(mes);

const endDate = utils.getDate(date)
endDate.setMonth(endDate.getMonth() + 1)

const fromDateIndex = () => {
  const i = periods.findIndex((x) => new Date(x.date) > date)
  return i > 200 ? i - 200 : 0
}
periods.splice(0, fromDateIndex())


const endDateIndex = () =>  {
  const i = periods.findIndex((x) => new Date(x.date) >= endDate)

  return i >= 0 ? i : periods.length - 1
}
periods.splice(endDateIndex(), periods.length)

periods.forEach((x, periodIndex) => {
  /* Calculate WMA */
  x.wma = {}
  for (let i = 0; i <= 200; i+=5) {
    x.wma[i] = calcWmaInBatch(periods, periodIndex, i === 0 ? 1 : i)
  }
  
  /* Calculate Stochastic */
  x.stochastic = calcStochasticInBatch(periods, periodIndex)
  
  /* Calculate ADX */ 
  x.adx = calcAdxInBatch(periods, periodIndex)
  
  /* Calculate OBC */
  x.obc = calcObcInBatch(periods, periodIndex)
})


const validPeriods = periods.filter((x) => {
  const d = new Date(x.date)
  return (d >= date && d < endDate) && x.wma[200]
})


log(validPeriods)

process.exit();


