require('module-alias/register');
const fs = require('fs')

const fetchCalcPeriods = require('@/operation/service/fetchCalcPeriods')
const { 
  rateClosedOverWma, rateClosedUnderWma, alwaysFalse, rateAboveWma, wmaCrossedOver, wmaCrossedUnder
} = require('@/simulateTradeHistory/service/conditions');
const getPerformance = require('../service/getPerformance')
const { daysBetweenDates } = require('@/services/utils');


const upperPeriodWma = 15

const algorithms = [
  {
    open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
      && rateAboveWma(c.upperPeriods.H1, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H2, upperPeriodWma),
    close: (p, c) => alwaysFalse(p, c)
  }
]

const gran = 'M5'
const symbol = 'GBPUSD'
const sinceDate = '2019-01-01T00:00:00.000Z';

(async () => {
  const periods = await fetchCalcPeriods(gran, symbol, sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const performances = []

  /* loop wma */
  // for (let wma = 5; wma < 100; wma += 5) {
    // console.log(`wma .. ${wma}`)

    for (let stopLoss = 0; stopLoss <= 20; stopLoss += 5) {
      for (let takeProfit = 0; takeProfit <= 20; takeProfit += 5) {
        /* loop algorithms */
        algorithms.forEach((algo, i) => {
          const conditions = {
            open: algo.open(5, 15),
            close: algo.close
          }
          const performance = getPerformance(periods)(conditions)(stopLoss)(takeProfit)
            (daysOfPeriods)
            (symbol)
            ()
          // performance.wma = wma
          performances.push(performance)
        })
      }
    }
  // }

  const validPerformances = performances.filter((x) => x.pipsPerTrade)

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../../cache/stats/rateClosedWma/${gran}/${symbol}.JSON`, JSON.stringify(validPerformances)
    )
  } catch (e) {
    throw new Error(e)
  }
})();