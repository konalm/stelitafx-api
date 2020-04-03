require('module-alias/register');

const fs = require('fs')
const { 
  stochasticCrossedOver, stochasticCrossedUnder 
} = require('@/simulateTradeHistory/service/conditions')
const getPerformance = require('./service/getPerformance')


const algorithms = [
  {
    open: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    close: (trigger) => (p, c) => stochasticCrossedUnder(p, c, trigger),
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
  let periods
  try {
    periods = JSON.parse( await fs.readFileSync('../cache/calculatedPeriods.JSON') )
  } catch (e) {
    throw new Error('Failed to read rates from cache')
  }

  for (let i = 0; i < algorithms.length; i++) {
    console.log(`algorithm .. ${i}`)

    try {
      await performAlgorithm(periods, algorithms[i])
    } catch (e) {
      console.log('Failed to perform algorithm')
      console.log(e)
    }
  }
})();


const performAlgorithm = async (periods, algorithm) => {
  const stats = []

  /* loop open triggers */
  for (let x = 0; x < 100; x += 5) {
    console.log(`i ... ${x}`)

    /* loop close triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }

      const stopLossPerformances = [
        (getPerformance(periods)(conditions)(y)(null)(null))
      ]

      /* loop stop loss performances */ 
      for (let stopLoss = 0; stopLoss <= 50; stopLoss += 5) {
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
  }

  console.log(`stats to write .... ${stats.length}`)

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../cache/stats/stochastic/${algorithm.cacheFilename}.JSON`, 
      JSON.stringify(stats)
    )
  } catch (e) {
    throw new Error(`Failed to write to cache`)
  }   
}

