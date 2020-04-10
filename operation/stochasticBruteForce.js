require('module-alias/register');

const fs = require('fs')
const { 
  stochasticCrossedOver, stochasticCrossedUnder 
  } = require('@/simulateTradeHistory/service/conditions')
const { daysBetweenDates } = require('@/services/utils');
const getPerformance = require('./service/getPerformance')

const sinceDate = '2019-01-01T00:00:00.000Z';
const abbrev = 'AUDUSD';
const stopLosses = [0, 1, 5, 15, 30, 50];


const algorithms = [
  {
    open: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
    close: trigger  => (p, c) => stochasticCrossedUnder(p, c, trigger),
    cacheFilename: 'overUnder'
  },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedOver(p, c, trigger),
    close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    cacheFilename: 'overOver'
  },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedUnder(p, c, trigger),
    close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    cacheFilename: 'underOver'
  },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedUnder(p, c, trigger),
    close: (trigger) => (p, c) => stochasticCrossedUnder(p, c, trigger),
    cacheFilename: 'underUnder'
  }
];


(async () => {
  let allPeriods
  try {
    allPeriods = JSON.parse(await fs.readFileSync(`../cache/calculatedPeriods/${abbrev}.JSON`, 'utf8'))
  } catch (e) {
    return console.error(e)
  }
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const stats = []
  for (let i = 0; i < algorithms.length; i++) {
    console.log(`algorithm .. ${i}`)

    let algoStats
    try {
      algoStats = await performAlgorithm(periods, algorithms[i], daysOfPeriods)
    } catch (e) {
      console.log('Failed to perform algorithm')
      console.log(e)
    }
    stats.push(...algoStats)
  }

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../cache/stats/stochastic/${abbrev}.JSON`, 
      JSON.stringify(stats)
    )
  } catch (e) {
    throw new Error(`Failed to write to cache`)
  }  
})();


const performAlgorithm = async (periods, algorithm, daysOfPeriods) => {
  const stats = []

  /* loop open triggers */
  for (let x = 0; x <= 100; x += 5) {
    console.log(`i ... ${x}`)

    /* loop close triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }

      /* loop stop loss performances */ 
      const stopLossPerformances = []
      for (let spIndex = 0; spIndex < stopLosses.length; spIndex += 1) {
        stopLossPerformances.push(
          getPerformance(periods)(conditions)(stopLosses[spIndex])(null)(daysOfPeriods)
        )
      }

      stats.push(
        ...stopLossPerformances.map((p) => ({
          openTrigger: x,  
          closeTrigger: y,
          ...p,
          algo: algorithm.cacheFilename
        }))
      )
    }
  } 

  return stats
}

