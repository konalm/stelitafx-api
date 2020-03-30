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

const stats = service.wmaPerformanceItemStats(slowWmaPerformances)

fs.writeFile(`cache/wmaPerformances/${wma}.JSON`, JSON.stringify(stats), (e) => {
  if (e) throw new Error(e)

  process.exit(wma);
})


