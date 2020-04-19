const simulateTrades = require('./simulateTrades')
const { tradesTotalPips } = require('@/simulateTradeHistory/service')
const winningTrades = require('./winningTrades')
const losingTrades = require('./losingTrades')
const { percentage } = require('@/services/utils');

module.exports = periods => conditions => stopLoss => stopGain => daysOfPeriods => abbrev =>
{
  console.log('get performance')
 
  
  const trades = simulateTrades(periods)(conditions)(stopLoss)(stopGain)(abbrev)
  const pips = tradesTotalPips(trades, abbrev)
  const wTrades = winningTrades(trades)
  const lTrades = losingTrades(trades)
  const tradesPerDay = trades.length / daysOfPeriods
  const pipsPerTrade = pips / trades.length
  const pipsPerDay = tradesPerDay * pipsPerTrade
  const costPerDay = tradesPerDay * 0.2;

  console.log('trades >>>>')
  console.log(trades)
      
  return {
    stopLoss,
    trades: trades.length,
    winningTrades: wTrades,
    losingTrades: lTrades,
    winPercentage: percentage(wTrades, lTrades),
    pips,
    pipsPerTrade: pips / trades.length,
    tradesPerDay,
    costPerDay,
    pipsPerDay,
    netPipsPerDay: pipsPerDay - costPerDay
  }
}