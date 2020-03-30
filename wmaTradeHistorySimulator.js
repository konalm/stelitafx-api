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

  const wmaPerformanceWorkers = []
  for (let fastWma = rangeSettings.min; fastWma <= rangeSettings.max; fastWma ++) {
    console.log('loop')

    // wmaPerformanceWorkers.push(
    //   wmaPerformanceWorker(fastWma, periods, rangeSettings.max, stopSettings)
    // )

    const slowWmaPerformances = service.getWmaPerformances(
      fastWma, periods, rangeSettings.max, stopSettings
    )
    
    const stats = service.wmaPerformanceItemStats(slowWmaPerformances)
      
    try {
      await fs.writeFileSync(`cache/wmaPerformances/${fastWma}.JSON`, JSON.stringify(stats))
    } catch (e) {
      throw new Error(e)
    }
  }

  console.log('finished looping');

  try {
    await Promise.all(wmaPerformanceWorkers)
  } catch (e) {
    console.log(e)
    throw new Error('Workers failed')
  }

  console.log('ALL WORKERS COMPLETE')
  process.exit();
})();



const wmaPerformanceWorker = (wma, periods, rangeSettingsMax, stopSettings) => 
  new Promise((resolve, reject) => 
{
  console.log('WMA PERFORMANCE WORKER PROMISE')

  const workerData = { wma, periods, rangeSettingsMax, stopSettings}
  const worker = new Worker('./wmaPerformance.js', { workerData })

  worker.on('message', (mes) => {
    console.log('RECIEVED MESSAGE FROM WORKER')
    console.log(mes)
  })
  worker.on('error', (e) => {
    console.log(e)
    console.log('WORKER ERROR')
  })
  worker.on('exit', () => {
    console.log('EXIT !!!!!')
    resolve()
  })
})
