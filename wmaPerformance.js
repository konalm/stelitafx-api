console.log('WORKERRRRRRRRRRRRRRRRRR');

require('module-alias/register');

const fs = require('fs');
const service = require('@/simulateTradeHistory/service');
const { workerData, parentPort } = require('worker_threads');

const { wma, periods, rangeSettingsMax, stopSettings } = workerData 

parentPort.postMessage(`WMA PERFORMANCE WORKER .. ${wma}`)

const slowWmaPerformances = service.getWmaPerformances(
  wma, periods, rangeSettingsMax, stopSettings
)

console.log(`slow performances ... ${slowWmaPerformances.length}`)

const stats = service.wmaPerformanceItemStats(slowWmaPerformances)


fs.writeFile(`cache/wmaPerformances/${wma}.JSON`, JSON.stringify(stats), (e) => {
  if (e) throw new Error(e)

  process.exit(wma);
})


