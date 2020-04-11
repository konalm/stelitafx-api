require('module-alias/register');

const fs = require('fs')
const { 
  rateAboveWma, stochasticCrossedOver, stochasticCrossedUnder 
} = require('@/simulateTradeHistory/service/conditions');
const stopLosses = [0, 1, 5, 15, 30, 50];
const Wmas = [5, 15, 30, 50, 100, 200];
const abbrev = 'GBPCAD'
const { daysBetweenDates, percentage } = require('@/services/utils');
const getPerformance = require('./service/getPerformance')

const sinceDate = '2019-01-01T00:00:00.000Z';

const algorithms = [
  {
    open: wma => trigger => (p, c) => rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    algo: 'overUnder'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),

    algo: 'overOver'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),

    algo: 'underOver'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    algo: 'underUnder'
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
    console.log(`ALGORITHM .... ${i}`)
    const algorithm = algorithms[i]

    let algoStats 
    try {
      algoStats = await performAlgorithm(periods, algorithm, daysOfPeriods)
    } catch (e) {
      console.log(e)
    }

    console.log(`ALGO STATS ... ${algoStats.length}`)

    stats.push(...algoStats)
  }

  console.log(`all stats ... ${stats.length}`)

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../cache/stats/rateAboveWmaStochastic/${abbrev}.JSON`,  
      JSON.stringify(stats)
    )
  } catch (e) {
    console.log(e)
  }
})();


/**
 * 
 */
const performAlgorithm = async (periods, algorithm, daysOfPeriods) => {
  const stats = []

  /* loop wma */ 
  for (let i = 0; i < Wmas.length; i ++) {
    const wma = Wmas[i]

    console.log(`rate above wma ... ${wma}`)

    const algorithmForWma = {
      open: algorithm.open(wma),
      close: algorithm.close,
      cacheFilename: algorithm.cacheFilename
    }
    const stochasticStats = await performStochasticAlgorithm(periods, algorithmForWma, daysOfPeriods)

    stats.push(
      ...stochasticStats.map((x) => ({
        wma,
        ...x
      }))
    )

    console.log(`wma stats .... ${stats.length}`)
  }

  return stats
}


/**
 * 
 */
const performStochasticAlgorithm = (periods, algorithm, daysOfPeriods) => 
  new Promise((resolve, reject) => 
{
  const stats = []

  /* loop open triggers */
  for (let x = 0; x < 100; x += 5) {
    console.log(`stochastic buy trigger ... ${x}`)

    /* loop close triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }

      /* loop stop loss possibilities */ 
      const stopLossPerformances = []
      for (let spIndex = 0; spIndex < stopLosses.length; spIndex += 1) {
        const stopLoss = stopLosses[spIndex]

        stopLossPerformances.push(
          getPerformance(periods)(conditions)(stopLoss)(null)(daysOfPeriods)(abbrev)
        )
      }

      stats.push(
        ...stopLossPerformances.map((p) => ({
          openTrigger: x,  
          closeTrigger: y,
          algorithm: algorithm.algo,
          ...p
        }))
      )
    }
  }

  resolve(stats)
})


// const getPerformance = periods => conditions => stopLoss => stopGain => daysOfPeriods =>
// {
//   const trades = simulateTrades(periods)(conditions)(stopLoss)(stopGain)
//   const pips = tradesTotalPips(trades)
//   const wTrades = winningTrades(trades)
//   const lTrades = losingTrades(trades)
//   const tradesPerDay = trades.length / daysOfPeriods
//   const pipsPerTrade = pips / trades.length
//   const pipsPerDay = tradesPerDay * pipsPerTrade
//   const costPerDay = tradesPerDay * 0.2;
        
//   return {
//     stopLoss,
//     trades: trades.length,
//     winningTrades: wTrades,
//     losingTrades: lTrades,
//     winPercentage: percentage(wTrades, lTrades),
//     pips,
//     pipsPerTrade: pips / trades.length,
//     tradesPerDay,
//     costPerDay,
//     pipsPerDay,
//     netPipsPerDay: pipsPerDay - costPerDay
//   }
// }