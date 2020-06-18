require('module-alias/register');
const fs = require('fs')

const fetchCalcPeriods = require('@/operation/service/fetchCalcPeriods')
const { 
  alwaysFalse, rateAboveWma, engulfedCandle
} = require('@/simulateTradeHistory/service/conditions');
const getPerformance = require('../service/getPerformance')
const { daysBetweenDates } = require('@/services/utils');


const upperPeriodWma = 15

const algorithms = [
  {
    open: (p, c) => engulfedCandle(p, c)
      && rateAboveWma(c, 150),
      // && rateAboveWma(c.upperPeriods.H2, upperPeriodWma),
      // && rateAboveWma(c.upperPeriods.H2, upperPeriodWma),
    close: (p, c) => alwaysFalse(p, c)
  }
]

const gran = 'H1'
const symbol = 'GBPUSD'
const sinceDate = '2017-01-01T00:00:00.000Z';

(async () => {
  const periods = await fetchCalcPeriods(gran, symbol, sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const performances = []

  // console.log(periods[0])

  // console.log(`period date .. ${periods[0].date}`)
  // console.log(`upper period h1 date .. ${periods[0].upperPeriods.H1.date}`)


  // console.log(`last period -->`)
  // console.log(`period date .. ${periods[periods.length - 1].date}`)
  // console.log(`upper period h1 date .. ${periods[periods.length - 1].upperPeriods.H1.date}`)


  /* loop wma */
  // for (let wma = 5; wma < 100; wma += 5) {
    // console.log(`wma .. ${wma}`)

    for (let stopLoss = 5; stopLoss <= 150; stopLoss += 5) {
      for (let takeProfit = 5; takeProfit <= 150; takeProfit += 5) {
        /* loop algorithms */
        algorithms.forEach((algo, i) => {
          const performance = getPerformance(periods)(algo)(stopLoss > 0 ? stopLoss : null)
            (takeProfit > 0 ? takeProfit : null)
            (daysOfPeriods)
            (symbol)
            ()
          performance.algo = 'engulfed'
          performances.push(performance)
        })
      }
    }
  // }

  const validPerformances = performances.filter((x) => x.pipsPerTrade)

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../../cache/stats/engulfed/${gran}/${symbol}.JSON`, JSON.stringify(validPerformances)
    )
  } catch (e) {
    throw new Error(e)
  }
})();