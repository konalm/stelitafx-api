require('module-alias/register');

const { workerData, parentPort } = require('worker_threads');
const simulateTrades = require('./simulateTrades');
const winningTrades = require('./winningTrades');
const { tradesTotalPips } = require('@/simulateTradeHistory/service');
const losingTrades = require('./losingTrades');
const { buyTrigger, algorithmJson, periods, daysOfPeriods } = workerData;
const { 
  stochasticCrossedOver, stochasticCrossedUnder
} = require('@/simulateTradeHistory/service/conditions');
const algorithm = JSON.parse(algorithmJson);

console.log('WORKER REACHED');

parentPort.postMessage('WORKER REACHED');
parentPort.postMessage(algorithm);

const stats = [];

const funcs = {
  crossedOver: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
  crossedUnder: trigger  => (p, c) => stochasticCrossedUnder(p, c, trigger)
};

const getPerformance = periods => conditions => stopLoss => stopGain => daysOfPeriods =>
{
  const trades = simulateTrades(periods)(conditions)(stopLoss > 0 ? stopLoss : 1)(stopGain)
  const pips = tradesTotalPips(trades)
        
  return {
    stopLoss,
    trades: trades.length,
    winningTrades: winningTrades(trades),
    losingTrades: losingTrades(trades),
    pips,
    pipsPerTrade: pips / trades.length,
    tradesPerDay: trades.length / daysOfPeriods
  }
};


(async() => {
  /* loop close triggers */
  for (let y = 5; y <= 100; y += 5) {
    const conditions = {  
      open: funcs[algorithm.open],  
      close: funcs[algorithm.close]
    }

    const performances = [
      getPerformance(periods)(conditions)(null)(null)(daysOfPeriods)
    ]

    /* loop stop loss performances */ 
    for (let stopLoss = 0; stopLoss <= 50; stopLoss += 5) {
      performances.push(getPerformance(periods)(conditions)(stopLoss)(null)(daysOfPeriods))
    }

    stats.push(
      ...performances.map((p) => ({
        openTrigger: buyTrigger,  
        closeTrigger: y,
        ...p
      }))
    )
  }

  parentPort.postMessage({ stats })
  process.exit()
})();
