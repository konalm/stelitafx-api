require('module-alias/register')

const fs = require('fs');
const moment = require('moment');
const { getCurrencyRatesSinceDate } = require('@/currencyRates/repository')
const service = require('@/simulateTradeHistory/service');
const { Worker } = require('worker_threads');
const secondsBetweenDates = require('@/services/secondsBetweenDates');
const calcWmaInBatch = require('@/indicators/wma/service/calcWmaInBatch')
const calcStochasticInBatch = require('@/indicators/stochastic/service/calcStochasticInBatch')


const sinceDate = '2019-12-01T00:00:00.000Z';
const interval = 5;
const abbrev= 'GBP/USD';
const min = 1, max = 200;

(async () => {
  let currencyRates;
  try {
    currencyRates = await getCurrencyRatesSinceDate(interval, abbrev, sinceDate);
  } catch (e) {
    return res.status(500).send('Failed to get currency rates');
  }

  const periods = [...currencyRates]

  periods.forEach((x, periodIndex) => {
    console.log(`periods .. ${periodIndex}`)

    /* Calculate WMA */
    x.wma = {}
    for (let i = min; i <= max; i++) {
      x.wma[i] = calcWmaInBatch(currencyRates, periodIndex, i)
    }

    /* Calculate Stochastic */
    x.stochastic = calcStochasticInBatch(currencyRates, periodIndex)
  })

  /* Write to cache */
  try {
    await fs.writeFileSync('cache/calculatedPeriods.JSON', JSON.stringify(periods))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }

  process.exit();
})();


const cahePreCalcRatesWorker = (week, rates, min, max) => new Promise((resolve, reject) => {
  const workerData = { week, rates, min, max };
  const worker = new Worker('./cachePreCalculatedRates.js', { workerData });
  worker.on('message', (mes) => { });
  worker.on('error', (e) => console.log(e));

  worker.on('exit', (exit) => {
    console.log('worker complete')
    resolve()
  });
});