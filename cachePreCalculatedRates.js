require('module-alias/register');

const fs = require('fs');
const service = require('./simulateTradeHistory/service');
const { workerData, parentPort } = require('worker_threads');

const { week, rates, min, max } = workerData;

parentPort.postMessage(`rates ... ${rates.length}`);
parentPort.postMessage(`min ${min}, max ${max}`);

(async () => {
  parentPort.postMessage(`cache pre calculated rates for week ... ${week}`)

  let periods = null;
  try {
    periods = await service.calcPeriodsWMAs(rates, min, max);
  } catch (e) {
    throw new Error('FAILED TO GET PERIODS');
  }

  parentPort.postMessage(`rates to cache ... ${rates.length}`)
  parentPort.postMessage(`periods ... ${periods.length}`)

  const validPeriods = periods.filter((x) => x.wma[max])

  parentPort.postMessage(`valid periods .. ${validPeriods.length}`)


  try {
    await fs.writeFileSync(`cache/simulatedPeriods/${week}.JSON`, JSON.stringify(periods))
  } catch (e) {
    throw new Error('Failed to cache simulated periods')
  }

  parentPort.postMessage(`CACHED RATES FOR WEEK`)
  process.exit();
})()