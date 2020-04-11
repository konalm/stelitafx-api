require('module-alias/register');

const fs = require('fs');
const simulateTrades = require('./service/simulateTrades');
const { tradesTotalPips } = require('@/simulateTradeHistory/service');
const { 
  adxCrossover, adxPlusDiUnder, adxAboveThreshold, adxPlusDiAbove
} = require('@/simulateTradeHistory/service/conditions');
// const getPerformance = require('./service/getPerformance')


const algorithms = [
  {
    open: threshold => (p, c) => adxAboveThreshold(p, c, threshold) && adxPlusDiAbove(p, c),
    close: threshold => (p, c) => adxPlusDiUnder(p, c) || adxAboveThreshold(p, c, threshold)
  }
];


(async () => {
  let periods
  try {
    periods = JSON.parse( await fs.readFileSync('../cache/calculatedPeriods.JSON', 'utf8') )
  } catch (e) {
    throw new Error('Failed to read rates from cache')
  }

  /* loop algorithms */
  for (let i = 0; i < algorithms.length; i ++) {
    try {
      await performAlgorithm(periods, algorithms[i])
    } catch (e) {
      console.log(e)
    }
  }
})();


const performAlgorithm = async (periods, algorithm) => {
  let performances = []

  /* loop ADX theshold */ 
  for (let x = 0; x <= 100; x += 5) {
    console.log(`ADX ... ${x}`)

    /* loop ADX limit threshold */ 
    for (let y = x + 5; y <= 100; y += 5) {
      console.log(`ADX Limit ... ${y}`)

      const conditions = { open: algorithm.open(x), close: algorithm.close(y) }
      const stopLossPerformances = getStopLossPerformances(periods, conditions, x)

      const adxStopLossPerformances = stopLossPerformances.map((z) => ({
        adxOpen: x,
        adxLimit: y,
        ...z
      }))

      performances.push(...adxStopLossPerformances)
    }
  }

  const minTrades = 100
  if (minTrades) performances = performances.filter((x) => x.trades >= minTrades)

  const best = performances.reduce((a, b) => (a.pipsPerTrade > b.pipsPerTrade) ? a : b)
  const worst = performances.reduce((a, b) => (a.pipsPerTrade < b.pipsPerTrade) ? a : b)


  // console.log(performances)

  console.log('best >>')
  console.log(best)

  console.log('worst >>')
  console.log(worst)


  return 

  /* write to cache */
  try {
    await fs.writeFileSync(`../cache/stats/adx/crossOver.JSON`, JSON.stringify(stat))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }
}

const getStopLossPerformances  = (periods, algorithm, adxThreshold, adxLimitThreshold) => {
  const stopLossPerformances = [
    (getPerformance(periods)(algorithm)(adxThreshold)(null))
  ]

  /* loop stop loss performance */
  for (let stopLoss = 0; stopLoss <= 50; stopLoss += 5) {
    stopLossPerformances.push(getPerformance(periods)(algorithm)(adxThreshold)(stopLoss))
  }

  return stopLossPerformances.filter((x) => x.pipsPerTrade)
}



const getPerformance = periods => conditions => adxThreshold => stopLoss => {
  const trades = simulateTrades(periods)(conditions)(stopLoss > 0 ? stopLoss : 1)(null)
  const pips = tradesTotalPips(trades)

  return {
    adxThreshold,
    stopLoss,
    trades: trades.length,
    pips,
    pipsPerTrade: pips / trades.length
  }
}