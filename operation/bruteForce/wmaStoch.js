require('module-alias/register');

const fs = require('fs');
const { Worker } = require('worker_threads');
const getMonthsSinceDate = require('@/operation/service/getMonthsSinceDate')
const secsBetweenDates = require('@/services/secondsBetweenDates')
const { daysBetweenDates } = require('@/services/utils');

const interval = 5;
const abbrev = 'GBPUSD';
const sinceDate = '2018-01-01T00:00:00.000Z';
const TYPE = 'long';


// const algos = [ 'overUnder', 'overOver', 'underOver', 'underUnder'];
const algos = ['underUnder', 'overOver'];

(async () => {
  let allPeriods
  try {
    allPeriods = JSON.parse(
      await fs.readFileSync(`../../cache/calculatedPeriods/${interval}/${abbrev}.JSON`, 'utf8')
    )
  } catch (e) {
    return console.error(e)
  }
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))
  const months = getMonthsSinceDate(sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())
  const s = new Date()

  const performAlgoWorkerPromises = []
  algos.forEach((a) => {
    performAlgoWorkerPromises.push(
      performAlgoWorker(periods, interval, abbrev, a, months, daysOfPeriods)
    )
  })

  try {
    await Promise.all(performAlgoWorkerPromises)
  } catch (e) {
    console.log('WORKERS FAIL')
    console.error(e)
  }
  console.log('Workers complete')

  process.on('exit', (() => { console.log(secsBetweenDates(s)); }))
})();


const performAlgoWorker = (periods, interval, abbrev, algo, months, daysOfPeriods) => 
  new Promise((resolve, _) => 
{
  console.log('PERFORM ALGO WORKER FOR ' + algo)

  const workerData = { periods, interval, abbrev, algo, months , daysOfPeriods}
  const workerPath = TYPE === 'long' ? 'wmaStochAlgoWorker' : 'wmaStochShortAlgoWorker';
  const worker = new Worker(`./${workerPath}.js`, { workerData });
  worker.on('message', (mes) => { });
  worker.on('error', (e) => console.log(e));

  worker.on('exit', (exit) => {
    console.log('worker complete')
    resolve()
  })
})
