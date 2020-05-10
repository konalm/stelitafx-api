require('module-alias/register');

const fs = require('fs');
const { Worker } = require('worker_threads');
const getCachedPeriodsSinceDate = require('@/candle/service/getCachedPeriodsSinceDate');
const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');
const monthsSinceDate = require('./service/getMonthsSinceDate')
const sinceDate = '2018-01-01T00:00:00.000Z';
const endDate = new Date();

const gran = 'M15';
const abbrev = 'GBP/USD';
const symbol = abbrev.replace("/", "");



const getPeriods = async (gran) => {
  let candles
  try {
    candles = await getCandlesSinceDate(sinceDate, endDate, gran, abbrev)
  } catch (e) {
    console.log(e)
    return console.error(`Failed to get candles`)
  }
  const periods = [...candles].map((x) => ({
    date: new Date(x.time),
    exchange_rate: parseFloat(x.mid.c),
    rate: parseFloat(x.mid.c),
    candle: x.mid,
    volume: x.volume
  }))

  return periods 
}


(async () => {
  const periods = await getPeriods(gran)
 

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
    const cacheFile = `../cache/calculatedPeriods/${gran}/${symbol}.JSON`
    await fs.writeFileSync(cacheFile, JSON.stringify(calculatedPeriods))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }

  process.exit();
})();


const calcPeriodsForMonthWorker = (date, periods) => new Promise((resolve, _) => {
  console.log(`calc periods for month worker for ${date}`)
  // console.log(periods)

 
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

