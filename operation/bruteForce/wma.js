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
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'upperPeriodBelowH2'
  // },
  {
    open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
      && rateAboveWma(c.upperPeriods.H1, upperPeriodWma),

    close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
    algo: 'upperPeriodAboveH1'
  },
  {
    open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
      && rateAboveWma(c.upperPeriods.H2, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),

    close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
    algo: 'upperPeriodAboveH2&RateAbove'
  },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
  //     && rateAboveWma(c.upperPeriods.H4, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'upperPeriodAboveH4'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H12, 200)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'upperPeriodBelowH12200&H4'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H12, 50)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'upperPeriodBelowH1250&H4'
  // },
  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedUnder(p, c, shortWma, longWma) 
  //     && rateAboveWma(c.upperPeriods.H6, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaOver(c, shortWma, longWma),
  //   algo: 'upperPeriodAboveH6'
  // },

  // {
  //   open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma) 
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

  //   close: (shortWma, longWma) => (p, c) => wmaUnder(c, shortWma, longWma),
  //   algo: 'upperPeriodBelowH12'
  // },
];

const gran = 'M15';
const abbrev = 'GBPUSD';
const sinceDate = '2019-01-01T00:00:00.000Z';
const stopLosses = [null, 1, 5, 15, 30, 50];
const stopGains = [null];

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
  console.log('WMA brute force')

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
    // for (let slowWma = fastWma + 5; slowWma <= 200; slowWma += 5) {
      console.log(`long wma .. ${slowWma}`)

      const stopPerformances = []
      
      /* loop stop loss */
      for (let stopLoss = 0; stopLoss <= 100; stopLoss += 5) {
        console.log(`stop loss .. ${stopLoss}`)

        /* loop stop gain */
        for (let takeProfit = 0; takeProfit <= 100; takeProfit += 5) {

          /* loop algorithms */
          algorithms.forEach((algo) => {
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