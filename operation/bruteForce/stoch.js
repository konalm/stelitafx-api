require('module-alias/register');

const fs = require('fs')
const { 
  stochasticCrossedOver, 
  stochasticCrossedUnder, 
  macdAbove, 
  macdUnder, 
  adxPlusDiAbove, 
  adxPlusDiUnder,
  adxBelowThreshold,
  adxAboveThreshold,
  adxPlusDiAboveThreshold,
  adxPlusDiBelowThreshold,
  adxMinusDiAboveThreshold,
  rateAboveWma
  } = require('@/simulateTradeHistory/service/conditions')
const { daysBetweenDates } = require('@/services/utils');
const getPerformance = require('../service/getPerformance')
const getMonthPerformances = require('@/operation/service/getMonthPerformances');
const getMonthsSinceDate = require('@/operation/service/getMonthsSinceDate')

const gran = 'M15'
const abbrev = 'GBPUSD';
const sinceDate = '2019-01-01T00:00:00.000Z';
const stopLosses = [null, 1, 5, 15, 30, 50];

const upperPeriodWma = 15


const algos = [
  // {
  //   open: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
  //   close: trigger  => (p, c) => stochasticCrossedUnder(p, c, trigger),
  //   cacheFilename: 'overUnder'
  // },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedOver(p, c, trigger)
      && rateAboveWma(c.upperPeriods.H2, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H4, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H6, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),
      // && adxPlusDiAboveThreshold(p, c, 20)
      // && adxPlusDiBelowThreshold(p, c, 30)
    close: (trigger) => (p, c) => stochasticCrossedUnder(p, c, trigger),
    algo: 'overUnder&UpperPeriod'
  },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedOver(p, c, trigger)
      && rateAboveWma(c.upperPeriods.H2, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H4, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H6, upperPeriodWma)
      && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),
      // && adxPlusDiAboveThreshold(p, c, 20)
      // && adxPlusDiBelowThreshold(p, c, 30)
    close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    algo: 'overOver&UpperPeriod'
  },
  // {
  //   open: (trigger) => (p, c) =>  stochasticCrossedUnder(p, c, trigger),
  //   close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
  //   cacheFilename: 'underOver'
  // },
  // {
  //   open: (trigger) => (p, c) =>  stochasticCrossedUnder(p, c, trigger),
  //     // && adxPlusDiAboveThreshold(p, c, 20)
  //     // && adxPlusDiBelowThreshold(p, c, 30),
  //   close: (trigger) => (p, c) => stochasticCrossedUnder(p, c, trigger),
  //   algo: 'underUnder'
  // }
];


(async () => {
  const filePath = `../../cache/calculatedPeriods/withRelatedUpper/${gran}/${abbrev}.JSON`
  const allPeriods = JSON.parse(await fs.readFileSync(filePath, 'utf8'))
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))

  const months = getMonthsSinceDate(sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const stats = []
  for (let i = 0; i < algos.length; i++) {
    console.log(`algorithm .. ${i}`)

    let algoStats
    try {
      algoStats = await performAlgorithm(periods, algos[i], daysOfPeriods, months)
    } catch (e) {
      console.log('Failed to perform algorithm')
      console.log(e)
    }
    stats.push(...algoStats)
  }

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../../cache/stats/stochastic/${gran}/${abbrev}.JSON`,  JSON.stringify(stats)
    )
  } catch (e) {
    throw new Error(`Failed to write to cache`)
  }  
})();


const performAlgorithm = async (periods, algo, daysOfPeriods, months) => {
  const stats = []

  const x = 20
  const y = 45

  /* loop open triggers */
  // for (let x = 0; x <= 20; x += 5) {
    console.log(`open trigger ... ${x}`)

    /* loop close triggers */
    // for (let y = 40; y <= 100; y += 5) {
      console.log(`close trigger ... ${y}`)

      const conditions = {  open: algo.open(x),  close: algo.close(y) }

      /* loop stop loss performances */ 
      const stopLossPerformances = []
      for (let stopLoss = 0; stopLoss <= 100; stopLoss += 5) {
        console.log(`stop loss .. ${stopLoss}`)

        for (let takeProfit = 0; takeProfit <= 100; takeProfit += 5) {
          // console.log(`take profit .. ${takeProfit}`)

          const performance = getPerformance(periods)(conditions)(stopLoss)(takeProfit)
            (daysOfPeriods)
            (abbrev)
            ()
          performance.algo = algo.algo 

          stopLossPerformances.push(performance)
        }
      }

      stats.push(
        ...stopLossPerformances.map((p) => ({
          openTrigger: x,  
          closeTrigger: y,
          ...p,
          algo: algo.algo
        }))
      )
    // }
  // } 

  return stats
}

