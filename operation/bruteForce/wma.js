require('module-alias/register');

const fs = require('fs');

const { 
  wmaCrossedOver, 
  wmaCrossedUnder,
  wmaUnder, 
  wmaOver, 
  rateAboveWma,
  rateBelowWma,
  adxPlusDiAbove, 
  adxPlusDiUnder, 
  adxAboveThreshold, 
  adxMinusDiAboveThreshold, 
  adxBelowThreshold,
  rateBelowUpperPeriodWma,
  trendUp,
  trendDown
} = require('@/simulateTradeHistory/service/conditions');
const { daysBetweenDates } = require('@/services/utils');
const getPerformance = require('../service/getPerformance')
const getMonthsSinceDate = require('@/operation/service/getMonthsSinceDate')
const getMonthPerformances = require('@/operation/service/getMonthPerformances');

const algorithms = [
  {
    open: (wma) => (c) => rateAboveWma(c, wma) && rateAboveWma(c, 100),
    close: (wma) => (c) => rateBelowWma(c, wma),
    desc: 'rateCrossWma'
  },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma),
  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'default'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma)
  //     && trendUp(p, c.upperHACandles['H1'])
  //     && trendUp(p, c.upperHACandles['H4']),
  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'trendUp'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma)
  //     && trendDown(p, c.upperHACandles['H1'])
  //     && trendDown(p, c.upperHACandles['H4']),
  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'trendDown'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
  //     && rateBelowUpperPeriodWma(c, 'H1', 150)
  //     && rateBelowUpperPeriodWma(c, 'H2', 150),
  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'M5__crossedUnder__H1_H2_rateBelowUpperPeriodWma'
  // },
];

const gran = 'M15';
const abbrev = 'EURUSD';
const sinceDate = '2019-01-01T00:00:00.000Z';
// const stopLosses = [null, 1, 5, 15, 30, 50];
// const stopGains = [null];

const getPeriods = async (gran, abbrev, sinceDate) => {
  let periods
  try {
    const filePath = `../../cache/calculatedPeriods/withRelatedUpper/${gran}/${abbrev}.JSON`
    periods = JSON.parse(await fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    return console.error(e)
  }

  return periods
    .filter((x) => new Date(x.date) >= new Date(sinceDate))
    .map((x) => ({
      ...x,
      rate: x.exchange_rate
    }))
}

(async () => {
  const periods = await getPeriods(gran, abbrev, sinceDate)

  const months = getMonthsSinceDate(sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const performances = []

  // const fastWma = 5
  // const slowWma = 15
 
 /* loop short wma */
  // for (let fastWma = 5; fastWma < 100; fastWma += 5) {
    // console.log(`short wma .. ${fastWma}`)

    /* loop long wma */ 
    // for (let slowWma = fastWma + 5; slowWma < 200; slowWma += 5) {
      // if (slowWma > 100) slowWma += 5

      // console.log(`long wma .. ${slowWma}`)

      const stopPerformances = []

      // const fastWma = 5
      // const slowWma = 15
      const stopLoss = null
      const takeProfit = null
      
      /* loop stop loss */
      // for (let stopLoss = 0; stopLoss <= 30; stopLoss += 5) {
        // console.log(`stop loss .. ${stopLoss}`)

        /* loop stop gain */
        // for (let takeProfit = 0; takeProfit <= 30; takeProfit += 5) {

          /* loop algorithms */
          algorithms.forEach((algo, i) => {
            const conditions = {
              open: algo.open(20),
              close: algo.close(20)
            }

            const performance = getPerformance(periods)(conditions)(stopLoss)(takeProfit)
              (daysOfPeriods)
              (abbrev)
              ()
            performance.desc = algo.desc
            // performance.fastWma = fastWma 
            // performance.slowWma = slowWma

            console.log(performance)
  
            stopPerformances.push(performance)
          })

        // }
      // }

      // performances.push(...stopPerformances.map((x) => ({ fastWma, slowWma, ...x })))
    // }
  // }
    
  // console.log(performance)
  
  const validPerformances = performances.filter((x) => x.pipsPerTrade)

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../../cache/stats/wma/${gran}/${abbrev}.JSON`, JSON.stringify(validPerformances)
    )
  } catch (e) {
    throw new Error(e)
  }
})();