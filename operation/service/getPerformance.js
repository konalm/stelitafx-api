const simulateTrades = require('./simulateTrades')
const { tradesTotalPips } = require('@/simulateTradeHistory/service')


module.exports = periods => conditions => sellTrigger => stopLoss => stopGain => 
{
  const trades = simulateTrades(periods)(conditions)(stopLoss > 0 ? stopLoss : 1)(stopGain)
  const pips = tradesTotalPips(trades)
        
  return {
    sellTrigger,
    stopLoss,
    trades: trades.length,
    pips,
    pipsPerTrade: pips / trades.length
  }
}