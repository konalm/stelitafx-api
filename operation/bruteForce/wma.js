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
  rateBelowUpperPeriodWma
} = require('@/simulateTradeHistory/service/conditions');
const { daysBetweenDates } = require('@/services/utils');
const getPerformance = require('../service/getPerformance')
const getMonthsSinceDate = require('@/operation/service/getMonthsSinceDate')
const getMonthPerformances = require('@/operation/service/getMonthPerformances');

const upperPeriodWma = 15

const algorithms = [
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'M5__none'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H1, 50)
  //     && rateBelowWma(c.upperPeriods.H2, 50),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'M5__crossedOver__H1_H2_>15'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H1, 100)
  //     && rateBelowWma(c.upperPeriods.H2, 100),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'M5__crossedUnder__H1_H2_>15'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && wmaUnder(c.upperPeriods.H1, 10, 100)
  //     && wmaUnder(c.upperPeriods.H2, 10, 100),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'M5__crossedOver__H1_H2_wmaOver'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && wmaUnder(c.upperPeriods.H1, 10, 100)
  //     && rateBelowWma(c.upperPeriods.H1, 15)
  //     && wmaUnder(c.upperPeriods.H2, 10, 100)
  //     && rateBelowWma(c.upperPeriods.H2, 15),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'M5__crossedOver__H1_H2_wmaOver__rate<200'
  // },
  {
    open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
      && rateBelowWma(c, 200)
      && rateBelowWma(c, 200),
    close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
    algo: 'M5__crossedOver__H1_H2_rateBelowUpperPeriodWma'
  },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
  //     && rateBelowUpperPeriodWma(c, 'H1', 150)
  //     && rateBelowUpperPeriodWma(c, 'H2', 150),
  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'M5__crossedUnder__H1_H2_rateBelowUpperPeriodWma'
  // },
];

const gran = 'M5';
const abbrev = 'GBPUSD';
const sinceDate = '2020-01-01T00:00:00.000Z';
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

  const fastWma = 5
  // const slowWma = 15
 
 /* loop short wma */
  // for (let fastWma = 5; fastWma < 100; fastWma += 5) {
    console.log(`short wma .. ${fastWma}`)

    /* loop long wma */ 
    for (let slowWma = fastWma + 5; slowWma < 200; slowWma += 5) {
      if (slowWma > 100) slowWma += 5

      // console.log(`long wma .. ${slowWma}`)

      const stopPerformances = []

      // const fastWma = 5
      // const slowWma = 15
      const stopLoss = null
      const takeProfit = null
      
      /* loop stop loss */
      // for (let stopLoss = 0; stopLoss <= 25; stopLoss += 5) {
        // console.log(`stop loss .. ${stopLoss}`)

        /* loop stop gain */
        // for (let takeProfit = 0; takeProfit <= 25; takeProfit += 5) {

          /* loop algorithms */
          algorithms.forEach((algo, i) => {
            const conditions = {
              open: algo.open(fastWma, slowWma),
              close: algo.close(fastWma, slowWma)
            }

            const performance = getPerformance(periods)(conditions)(stopLoss)(takeProfit)
              (daysOfPeriods)
              (abbrev)
              ()
            performance.algo = algo.algo
            performance.fastWma = fastWma 
            performance.slowWma = slowWma

            // console.log('BACK CHECK -->')
            // console.log(performance)
  
            stopPerformances.push(performance)
          })
        // }
      // }

      performances.push(...stopPerformances.map((x) => ({ fastWma, slowWma, ...x })))
    }
  // }
    
  
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