require('module-alias/register');

const fs = require('fs');
const { Worker } = require('worker_threads');
const getCachedPeriodsSinceDate = require('@/candle/service/getCachedPeriodsSinceDate');
const monthsSinceDate = require('./service/getMonthsSinceDate')
const sinceDate = '2017-01-01T00:00:00.000Z';
const abbrev= 'EURGBP';


(async () => {
  let periods 
  try {
    periods = await getCachedPeriodsSinceDate(abbrev, sinceDate)
  } catch (e) {
    return console.log(e)
  }

  console.log(`periods from cache ... ${periods.length}`)

  const workerPromises = []
  monthsSinceDate(sinceDate).forEach((x) => {
    workerPromises.push(calcPeriodsForMonthWorker(x, periods))
  })

  let monthsCalculatedPeriods 
  try {
    monthsCalculatedPeriods = await Promise.all(workerPromises)
  } catch (e) {
    return console.error(e)
  }

  const calculatedPeriods = monthsCalculatedPeriods
    .flat()
    .sort((a, b) => new Date(a) - new Date(b))
  
  console.log(`calculated periods ... ${calculatedPeriods.length}`)

  /* Write to cache */
  try {
    const cacheFile = `../cache/calculatedPeriods/${abbrev}.JSON`
    await fs.writeFileSync(cacheFile, JSON.stringify(calculatedPeriods))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }

  process.exit();
})();


const calcPeriodsForMonthWorker = (date, periods) => new Promise((resolve, _) => {
  console.log(`calc periods for month worker for ${date}`)
  
  const workerData = { date, periods }
  const worker = new Worker('./service/calcPeriodsForMonthWorker.js', { workerData })

  let calcPeriods = []
  worker.on('message', (mes) => { 
    console.log(`MESSAGE FROM WORKER: ${mes.length}`) 
    calcPeriods = mes
  });
  worker.on('error', (e) => { console.log(`ERROR FROM WORKER: ${e}`) });

  worker.on('exit', (e) => {
    console.log(`worker complete for ${date} with ${calcPeriods.length}`)
    resolve(calcPeriods)
  })
})

