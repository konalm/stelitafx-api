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
  rateAboveWma,
  rateBelowWma,
  trendUp,
  trendDown,
  upperTrendUp,
  upperTrendDown,
  progressiveTrendUp
} = require('@/simulateTradeHistory/service/conditions')
const { daysBetweenDates } = require('@/services/utils');
const getPerformance = require('../service/getPerformance')
const getMonthPerformances = require('@/operation/service/getMonthPerformances');
const getMonthsSinceDate = require('@/operation/service/getMonthsSinceDate')
const fetchHACandles = require('@/candle/service/getHeikenAshiCandlesSinceDate')
const fetchHATrendGroups = require('@/candle/service/heikenAshiGroupTrends')
 

const gran = 'M5'
const abbrev = 'GBPUSD';
const sinceDate = '2017-10-01T00:00:00.000Z';
// const stopLosses = [null, 1, 5, 15, 30, 50];

const upperPeriodWma = 15


const algos = [
  // {
  //   open: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
  //   close: trigger  => (p, c) => stochasticCrossedUnder(p, c, trigger),
  //   cacheFilename: 'overUnder'p
  // },
  // {
  //   open: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger)
  //     && rateAboveWma(c.upperPeriods.H2, upperPeriodWma)
  //     && rateAboveWma(c.upperPeriods.H4, upperPeriodWma)
  //     && rateAboveWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),
  //   close: (trigger) => (p, c) => stochasticCrossedUnder(p, c, trigger),
  //   algo: 'overUnder&UpperPeriod'
  // },
  // {
  //   open: (trigger) => (p, c) =>  stochasticCrossedOver(p, c, trigger)
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),
      // && adxPlusDiAboveThreshold(p, c, 20)
      // && adxPlusDiBelowThreshold(p, c, 30)
    // close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    // algo: 'overOver&UpperPeriod'
  // },
  {
    open: (haTrendGroups, haCandles) => (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger)
      && upperTrendUp(c.upperHACandles['H1'])
      && upperTrendUp(c.upperHACandles['H4'])
      && rateAboveWma(c, 100),

      // && progressiveTrendUp(c.upperHACandles['H1'], haTrendGroups, haCandles)
      // && progressiveTrendUp(c.upperHACandles['H4'], haTrendGroups, haCandles),

      // && trendUp(c.upperHACandles['H4']),
      // && trendUp(c.upperHACandles['H1']),

      // && rateBelowWma(c.upperPeriods.H1, upperPeriodWma)
      // && rateBelowWma(c.upperPeriods.H2, upperPeriodWma)
      // && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
      // && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
      // && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

    close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    algo: 'overOver'
  },
  // {
  //   open: (trigger) => (p, c) =>  stochasticCrossedUnder(p, c, trigger)
  //     && rateBelowWma(c.upperPeriods.H1, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),
  //   close: (trigger) => (p, c) => stochasticCrossedUnder(p, c, trigger),
  //   algo: 'underUnder__upperPeriod'
  // }
];


(async () => {
  console.log('BRUTE FORCE STOCH')
  const filePath = `./cache/calculatedPeriods/withRelatedUpper/${gran}/${abbrev}.JSON`
  const allPeriods = JSON.parse(await fs.readFileSync(filePath, 'utf8'))
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))  
  const months = getMonthsSinceDate(sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())


  const HACandles = await fetchHACandles(gran, abbrev, sinceDate)
  const HATrendGroups = fetchHATrendGroups(HACandles)

  console.log(`HA Candles .. ${HACandles.length}`)
  console.log(`HA trend groupd .. ${HATrendGroups.length}`)


  console.log(`periods length .. ${periods.length}`)


  const stats = []
  for (let i = 0; i < algos.length; i++) {
    console.log(`algorithm .. ${i}`)

    let algoStats
    try {
      algoStats = await performAlgorithm(
        periods, algos[i], daysOfPeriods, months, HACandles, HATrendGroups
      )
    } catch (e) {
      console.log('Failed to perform algorithm')
      console.log(e)
    }
    stats.push(...algoStats)
  }

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `./cache/stats/stochastic/${gran}/${abbrev}.JSON`,  JSON.stringify(stats)
    )
  } catch (e) {
    throw new Error(`Failed to write to cache`)
  }  
})();


const performAlgorithm = async (periods, algo, daysOfPeriods, months, HACandles, HATrendGroups) => {
  const stats = []

  const x = 90
  const y = 95

  
  /* loop open triggers */
  // for (let x = 0; x <= 100; x += 5) {
    /* loop close triggers */
    // for (let y = 0; y <= 100; y += 5) {
      if (y === 100) y = 99

      const conditions = {  open: algo.open(HATrendGroups, HACandles)(x),  close: algo.close(y) }

      const stopLoss = null
      const takeProfit = null

      /* loop stop loss performances */ 
      const stopLossPerformances = []
      // for (let stopLoss = 0; stopLoss <= 50; stopLoss += 5) {
        // for (let takeProfit = 0; takeProfit <= 50; takeProfit += 5) {
          const performance = getPerformance(periods)(conditions)(stopLoss)(takeProfit)
            (daysOfPeriods)
            (abbrev)
            ()
          performance.algo = algo.algo 

          stopLossPerformances.push(performance)
        // }
      // }

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

