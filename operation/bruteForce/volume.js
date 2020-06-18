require('module-alias/register');
const fs = require('fs')

const fetchPeriods = require('@/operation/service/fetchCalcPeriods')
const getPerformance = require('../service/getPerformance')
const { 
  volumeThrust, alwaysFalse, bullCandle, minVolume 
} = require('@/simulateTradeHistory/service/conditions');
const { daysBetweenDates } = require('@/services/utils');

const gran = 'M5';
const symbol = 'GBPUSD';
const sinceDate = '2019-01-01T00:00:00.000Z';

const algo = {
  open: (thrust, min) => (p, c) => bullCandle(c.candle) 
    && volumeThrust(p, c, thrust)
    && minVolume(p, c, min),
  close: (p, c) => alwaysFalse(p, c)
};


(async () => {
  const periods = await fetchPeriods(gran, symbol, sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  // const takeProfit = 5
  // const stopLoss = 5

  const conditions = {
    open: algo.open(2.5, 500),
    close: algo.close
  }

  const performances = []

  /* loop stop loss */
  for (let stopLoss = 20; stopLoss <= 50; stopLoss += 5) {
    /* loop take profit */
    for (let takeProfit = 20; takeProfit <= 50; takeProfit += 5) {
      const performance = getPerformance(periods)(conditions)(stopLoss)(takeProfit)
        (daysOfPeriods)
        (symbol)
        ()
      performances.push(performance)
    }
  }

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../../cache/stats/volume/${gran}/${symbol}.JSON`, JSON.stringify(performances)
    )
  } catch (e) {
    throw new Error(e)
  }
})();