require('module-alias/register');

const fs = require('fs')
const simulateTrades = require('./service/simulateTrades')
const { tradesTotalPips } = require('@/simulateTradeHistory/service')
const { 
  rateAboveWma, stochasticCrossedOver, stochasticCrossedUnder 
} = require('@/simulateTradeHistory/service/conditions');
const getPerformance = require('./service/getPerformance');

const stopLosses = [1, 5, 15, 30, 50]
const minTrades = 500;
const Wmas = [5, 15, 30, 50, 100, 200];

const algorithms = [
  {
    open: wma => trigger => (p, c) => rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    cacheFilename: 'overUnder'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),

    cacheFilename: 'overOver'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),

    cacheFilename: 'underOver'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    cacheFilename: 'underUnder'
  }
];

(async () => {
  let periods
  try {
    periods = JSON.parse( await fs.readFileSync('../cache/calculatedPeriods.JSON') )
  } catch (e) {
    throw new Error('Failed to read rates from cache')
  }

  for (let i = 0; i < algorithms.length; i++) {
    console.log(`ALGORITHM .... ${i}`)
    const algorithm = algorithms[i]

    let stats 
    try {
      stats = await performAlgorithm(periods, algorithm)
    } catch (e) {
      console.log(e)
    }

    /* write to cache */ 
    try {
      await fs.writeFileSync(
        `../cache/stats/rateAboveWmaStochastic/${algorithm.cacheFilename}.JSON`,  
        JSON.stringify(stats)
      )
    } catch (e) {
      console.log(e)
    }
  }
})();


const performAlgorithm = async (periods, algorithm) => {
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
    const stochasticStats = await performStochasticAlgorithm(periods, algorithmForWma)

    stats.push(stochasticStats)
  }

  return stats
}


const performStochasticAlgorithm = (periods, algorithm) => 
  new Promise((resolve, reject) => 
{
  const stats = []

  /* loop open triggers */
  for (let x = 0; x < 100; x += 5) {
    console.log(`buy trigger ... ${x}`)

    /* loop close triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }

      const stopLossPerformances = [
        (getPerformance(periods)(conditions)(y)(null)(null))
      ]

      /* loop stop loss possibilities */ 
      for (let stopLoss = 0; stopLoss < stopLosses.length; stopLoss += 5) {
        stopLossPerformances.push(getPerformance(periods)(conditions)(y)(stopLoss)(null))
      }

       /* best stop loss performance for open & close trigger combination */ 
       const bestStopLossPerformance = stopLossPerformances.reduce(
        (a, b) => (a.pipsPerTrade > b.pipsPerTrade) ? a : b
      )
      /* worst stop loss performance for open & close trigger combination */ 
      const worstStopLossPerformance =  stopLossPerformances.reduce((a, b) => 
        a.pipsPerTrade < b.pipsPerTrade ? a : b
      )

      stats.push(
        { buyTrigger: x, ...bestStopLossPerformance },
        { buyTrigger: x, ...worstStopLossPerformance }
      )
    }

    resolve(stats)
  }
})