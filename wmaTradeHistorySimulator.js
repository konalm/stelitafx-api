require('module-alias/register');

const fs = require('fs')
const { Worker } = require('worker_threads')

const service = require('./simulateTradeHistory/service');

const interval = 5;
const abbrev = 'GBP/USD';
const sinceDate = '2019-12-04T00:00:00.000Z';
const rangeSettings = { min: 1, max: 200 };
const stopSettings = {
  loss: { min: 1, max: 25 },
  gain: { min: 1, max: 25 }
};

(async () => {
  console.log('wma trade history simulator')

  const updateCache = false
  if (updateCache) {
    try {
      await service.updateSimulatedPeriodsCache(interval, abbrev, sinceDate, rangeSettings)
    } catch (e) {
      return res.status(500).send(e)
    }

    console.log('cache updated')
    return 
  }

  let periods
  try {
    periods = await service.getCachedCalcPeriods()
  } catch (e) {
    return res.status(500).send('Failed to get cached calculated periods')
  }

  console.log(`periods ... ${periods.length}`)

  let wmaPerformanceWorkers = [];
  for (let fastWma = rangeSettings.min; fastWma <= rangeSettings.max; fastWma ++) {
    console.log(`WMA ... ${fastWma}`)
    
    wmaPerformanceWorkers.push(
      wmaPerformanceWorker(fastWma, periods, rangeSettings.max, stopSettings)
    )

    console.log(`workers ... ${wmaPerformanceWorkers.length}`)

    if (wmaPerformanceWorkers.length === 10) {
      try {
        await Promise.all(wmaPerformanceWorkers);
      } catch (e) {
        console.log(e);
        throw new Error('Workers failed');
      }

      console.log(`FINISHED SET OF WORKERS`)

      wmaPerformanceWorkers = [];
    }
  }

  console.log('ALL WORKERS COMPLETE');

  process.exit();
})();



const wmaPerformanceWorker = (wma, periods, rangeSettingsMax, stopSettings) => 
  new Promise((resolve, reject) => 
{
  const workerData = { wma, periods, rangeSettingsMax, stopSettings};
  const worker = new Worker('./wmaPerformance.js', { workerData });

  worker.on('message', (mes) => {
    console.log('RECIEVED MESSAGE FROM WORKER')
    console.log(mes)
  })
  worker.on('error', (e) => {
    console.log(e)
    console.log('WORKER ERROR')
  })
  worker.on('exit', (wma) => {
    console.log('wma performance worker complete for ' + wma)
    resolve()
  })
})
