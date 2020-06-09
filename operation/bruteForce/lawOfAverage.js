require('module-alias/register');
const fs = require('fs')

const symbol = 'USDJPY';
const gran = 'M5';
const sinceDate = '2019-01-01T00:00:00.000Z';
const { alwaysFalse, alwaysTrue, rateAboveWma, rateBelowWma } = require('@/simulateTradeHistory/service/conditions');
const getPerformance = require('../service/getPerformance');
const { daysBetweenDates } = require('@/services/utils');


(async () => {
  const filePath = `../../cache/calculatedPeriods/withRelatedUpper/${gran}/${symbol}.JSON`
  const allPeriods = JSON.parse(await fs.readFileSync(filePath, 'utf8'))
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const conditions = {
    open: (p, c) => rateAboveWma(c.upperPeriods.H1, 15) 
      // && rateBelowWma(c.upperPeriods.H2, 15) 
      // && rateAboveWma(c.upperPeriods.H6, 15) 
      // && rateAboveWma(c.upperPeriods.H12, 15) 
      && alwaysTrue(p, c),
    close: (p, c) => alwaysFalse(p, c)
  }  

  const performances = []
  for (stopLoss = 5; stopLoss <= 50; stopLoss += 5) {
    for (takeProfit = 5; takeProfit <= 50; takeProfit += 5) {
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
      `../../cache/stats/lawOfAverage/${gran}/${symbol}.JSON`, JSON.stringify(performances)
    )
  } catch (e) {
    throw new Error(e)
  }
})();