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
  adxBelowThreshold
} = require('@/simulateTradeHistory/service/conditions');
const { daysBetweenDates } = require('@/services/utils');
const getPerformance = require('../service/getPerformance')
const getMonthsSinceDate = require('@/operation/service/getMonthsSinceDate')
const getMonthPerformances = require('@/operation/service/getMonthPerformances');

const upperPeriodWma = 15

const algorithms = [
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma)
  //     && rateAboveWma(c.upperPeriods.H1, upperPeriodWma),
  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'crossedUnder__H1'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma)
  //     && rateAboveWma(c.upperPeriods.H1, upperPeriodWma),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'crossedOver__H1'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma)
  //     && rateAboveWma(c.upperPeriods.H3, upperPeriodWma),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'H3'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma)
  //     && rateAboveWma(c.upperPeriods.H6, upperPeriodWma),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'H6'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma)
  //     && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'H12'
  // },
  {
    open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
      && rateAboveWma(c.upperPeriods.H1, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H2, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H4, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H6, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),

    close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
    algo: 'crossedOver__H1-H12'
  },
  {
    open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
      && rateAboveWma(c.upperPeriods.H1, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H2, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H4, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H6, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),

    close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
    algo: 'crossedUnder__H1-H12'
  },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateAboveWma(c.upperPeriods.H3, upperPeriodWma)
  //     && rateAboveWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),
      
  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'Aligned__H3-H12'
  // },
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'H2'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'H4'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H6, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'H6'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'H12'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H1, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'Aligned__H1-H12'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'Aligned__H2-H12'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'Aligned__H4-H12'
  // }
];

const gran = 'M15';
const abbrev = 'GBPCAD';
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

  console.log(`days of periods .. ${daysOfPeriods}`)


  const performances = []

  const fastWma = 5
  const slowWma = 15
 
 /* loop short wma */
  // for (let fastWma = 5; fastWma < 200; fastWma += 5) {
    console.log(`short wma .. ${fastWma}`)

    /* loop long wma */ 
    // for (let slowWma = fastWma + 5; slowWma < 200; slowWma += 5) {
      if (slowWma > 100) slowWma += 5

      console.log(`long wma .. ${slowWma}`)

      const stopPerformances = []
      
      /* loop stop loss */
      for (let stopLoss = 0; stopLoss <= 50; stopLoss += 5) {
        // console.log(`stop loss .. ${stopLoss}`)

        /* loop stop gain */
        for (let takeProfit = 0; takeProfit <= 50; takeProfit += 5) {

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
  
            stopPerformances.push(performance)
          })
        }
      }

      performances.push(...stopPerformances.map((x) => ({ fastWma, slowWma, ...x })))
    // }
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