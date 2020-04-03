require('module-alias/register');

const fs = require('fs')
const simulateTrades = require('./service/simulateTrades')
const { tradesTotalPips } = require('@/simulateTradeHistory/service')
const { 
  wmaOver, stochasticCrossedOver, stochasticCrossedUnder 
} = require('@/simulateTradeHistory/service/conditions')

const stopLosses = [1, 5, 15, 30, 50]
const minTrades = 500;
const wmas = [1, 5, 15, 30, 50, 100, 150, 200];


const algorithms = [
  {
    open: (shortWma, longWma) => trigger => (p, c) => wmaOver(c, shortWma, longWma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    cacheFilename: 'overUnder'
  },
  {
    open: (shortWma, longWma) => trigger => (p, c) => wmaOver(c, shortWma, longWma) 
      && stochasticCrossedOver(p, c, trigger),

    close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),

    cacheFilename: 'overOver'
  },
  {
    open: (shortWma, longWma) => trigger => (p, c) =>  wmaOver(c, shortWma, longWma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),

    cacheFilename: 'underOver'
  },
  {
    open: (shortWma, longWma) => trigger => (p, c) =>  wmaOver(c, shortWma, longWma) 
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

  /* loop every algorithm */ 
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
        `../cache/stats/wmaCrossedOverStochastic/${algorithm.cacheFilename}.JSON`,  
        JSON.stringify(stats)
      )
    } catch (e) {
      console.log(e)
    }
  }
})();


const performAlgorithm = async (periods, algorithm) => {
  const stats = []

  /* loop every short wma */
  for (let i = 0; i < wmas.length; i ++) {
    const shortWma = wmas[i]

    console.log(`short wma ... ${shortWma}`)

    /* loop every long wma */
    for (let y = i + 1; y < wmas.length; y ++) {
      const longWma = wmas[y]

      console.log(`long wma ... ${longWma}`)

      const algorithmForWmaOver = {
        open: algorithm.open(shortWma, longWma),
        close: algorithm.close,
        cacheFilename: algorithm.cacheFilename
      }
      const stochasticStats = await performStochasticAlgorithm(periods, algorithmForWmaOver)

      if (stochasticStats.length) {
        const best = stochasticStats.reduce((a, b) => (a.best.pipsPerTrade > b.best.pipsPerTrade) ? a : b)
        const worst = stochasticStats.reduce((a, b) => (a.worst.pipsPerTrade < b.worst.pipsPerTrade) ? a : b)
        
        const stat = {
          shortWma,
          longWma,
          best: {
            buyTrigger: best.buyTrigger,
            ...best.best
          },
          worst: {
            buyTrigger: worst.buyTrigger,
            ...worst.worst
          }
        }
        
        stats.push(stat)
      }
    }
  }

  return stats
}


const performStochasticAlgorithm = (periods, algorithm) => 
  new Promise((resolve, reject) => 
{
  const stats = []

  /* loop buy triggers */
  for (let x = 0; x < 100; x += 5) {
    const stopLossPerformances = []

    /* loop sell triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }

      stopLossPerformances.push (performance(periods, conditions, null, y))

      /* loop stop loss possibilities */ 
      for (let stopLoss = 0; stopLoss < stopLosses.length; stopLoss += 5) {
        stopLossPerformances.push (performance(periods, conditions, stopLoss, y))
      }
    }

    if (stopLossPerformances.length) {
      stats.push({
        buyTrigger: x,
        best: stopLossPerformances.reduce((a, b) => (a.pipsPerTrade > b.pipsPerTrade) ? a : b),
        worst: stopLossPerformances.reduce((a, b) => a.pipsPerTrade < b.pipsPerTrade ? a : b)
      })
    }

    resolve(stats)
  }
})


const performance = (periods, conditions, stopLoss, sellTrigger) => {
  const trades = simulateTrades(periods)(conditions)(stopLoss)(null)
  const pips = tradesTotalPips(trades)

  return {
    sellTrigger,
    stopLoss,
    trades: trades.length,
    pips,
    pipsPerTrade: pips / trades.length
  }
}