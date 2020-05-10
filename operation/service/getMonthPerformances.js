const simulateTrades = require('./simulateTrades')
const { tradesTotalPips } = require('@/simulateTradeHistory/service')
// const getWinningTrades = require('./winningTrades')
// const losingTrades = require('./losingTrades')
const { percentage } = require('@/services/utils');
const minsBetweenDates = require('@/services/minsBetweenDates');

module.exports = 
  periods => 
  conditions => 
  stopLoss => 
  stopGain => 
  abbrev =>
  months =>
  daysOfPeriods =>
  upperPeriods =>
{
  const allTrades = simulateTrades(periods)(conditions)(stopLoss)(stopGain)(abbrev)

  /* get performance for each month */
  const performances = []
  months.forEach((month) => {
    const trades = monthTrades(month, allTrades)
    let performance = getPerformance(trades, abbrev, stopLoss, stopGain, 22)
    performances.push({ ...performance, month })
  })

  /* get performance overall */
  const overallPerformance = getPerformance(allTrades, abbrev, stopLoss, stopGain, daysOfPeriods)
  performances.push({ ...overallPerformance, month: 'all'})

  return performances
}


const monthTrades = (date, trades) => {
  const bDate = new Date(date)
  const eDate = new Date(date.getTime())
  eDate.setMonth(eDate.getMonth() + 1)

  return trades.filter((x) => {
    const d = new Date(x.open.date)
    return d >= bDate && d < eDate
  })
}

const getPerformance = (trades, abbrev, stopLoss, stopGain, days) => {
  const pips = tradesTotalPips(trades, abbrev)
  const winningTrades = getWinningTrades(trades).length
  const losingTrades = getLosingTrades(trades).length
  const tradesPerDay = trades.length / days
  const pipsPerTrade = pips / trades.length
  const pipsPerDay = tradesPerDay * pipsPerTrade
  const costPerDay = tradesPerDay * 0.3;

  return {
    stopLoss,
    stopGain,
    trades: trades.length,
    winningTrades: winningTrades,
    losingTrades: losingTrades,
    winPercentage: percentage(winningTrades, losingTrades),
    pips,
    pipsPerTrade: pips / trades.length,
    avgDuration: tradesAvgDuration(trades),
    tradesPerDay,
    costPerDay,
    pipsPerDay,
    netPipsPerDay: pipsPerDay - costPerDay
  }
}

const getWinningTrades = trades => trades.filter((x) => x.open.exchange_rate < x.close.exchange_rate)

const getLosingTrades = trades => trades.filter((x) => x.open.exchange_rate > x.close.exchange_rate)

const tradesAvgDuration = (trades) => trades.reduce(
  (sum, x) => sum + minsBetweenDates(x.open.date, x.close.date), 0
) / trades.length