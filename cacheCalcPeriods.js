require('module-alias/register')

const moment = require('Moment');
const { getCurrencyRatesSinceDate } = require('@/currencyRates/repository')
const service = require('@/simulateTradeHistory/service');
const { Worker } = require('worker_threads');''

const sinceDate = '2019-12-04T00:00:00.000Z';
const interval = 5;
const abbrev= 'GBP/USD';
const weeks = service.getWeeksSinceDate(sinceDate);
const min = 1, max = 5;

(async () => {
  /* Get currency rates from the DB */
  let currencyRates;
  try {
    currencyRates = await getCurrencyRatesSinceDate(interval, abbrev, sinceDate);
  } catch (e) {
    return res.status(500).send('Failed to get currency rates');
  }

  /* group rates into a week */
  const currencyRatesByWeek = [];
  weeks.forEach((w, i) => {
    const week = `${moment(w.beginning).format('YYYY-MM-DD')}--${moment(w.end).format('YYYY-MM-DD')}`;

    const rates = currencyRates.filter((x) => {
      const d = new Date(x.date)

      return d >= w.beginning && d <= w.end
    })

    if ( i > 0 ) {
      const priorRates = [...currencyRatesByWeek[currencyRatesByWeek.length - 1].rates]
      const priorRatesForWMa = priorRates.splice(priorRates.length - max, max)
      rates.unshift(...priorRatesForWMa)
    }

    currencyRatesByWeek.push({ week, rates })
  });

  /* Spawn worker to cache rates for each week */
  const workerPromises = [];
  currencyRatesByWeek.forEach((x) => {
    workerPromises.push(cahePreCalcRatesWorker(x.week, x.rates, min, max));
  })

  try {
    await Promise.all(workerPromises);
  } catch (e) {
    console.log(e);
    console.log('workers failed');
  }

  console.log('ALL WORKERS COMPLETE');
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