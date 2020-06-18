const simulateTrades = require('./simulateTrades')
const simulateTradesV2 = require('./simulateTradesV2')
const { tradesTotalPips } = require('@/simulateTradeHistory/service')
// const getWinningTrades = require('./winningTrades')
// const losingTrades = require('./losingTrades')
const { percentage, percentageOf } = require('@/services/utils');
const minsBetweenDates = require('@/services/minsBetweenDates');

const tradesAvgDuration = (trades) => trades.reduce(
  (sum, x) => sum + minsBetweenDates(x.open.date, x.close.date), 0
) / trades.length


module.exports = 
  periods => conditions => stopLoss => stopGain => daysOfPeriods => abbrev => upperPeriods =>
{
  const trades = simulateTrades(periods)(conditions)(stopLoss)(stopGain)(abbrev)
  // const trades = simulateTradesV2(periods)(conditions)(stopLoss)(stopGain)(abbrev)

  // if (trades.length) {
  //   trades.forEach((trade) => {
  //     trade.upperPeriod = getRelatedUpperTrade(trade)(upperPeriods)
  //   })
  // }

  const pips = tradesTotalPips(trades, abbrev)
  const winningTrades = getWinningTrades(trades)
  const losingTrades = getLosingTrades(trades)
  const tradesPerDay = trades.length / daysOfPeriods
  const pipsPerTrade = pips / trades.length
  const pipsPerDay = tradesPerDay * pipsPerTrade
  const costPerDay = tradesPerDay * 0.2;

  const totalWinningPips = tradesTotalPips(winningTrades, abbrev)
  const wAvgPips = totalWinningPips / winningTrades.length
  const totalLosingPips = tradesTotalPips(losingTrades, abbrev)
  const lAvgPips = totalLosingPips / losingTrades.length

  
  // console.log()
  // console.log(`trades ... ${trades.length}`)
  // const tradesUpperPeriodCriteria = upperPeriodRateAbove200WMA(trades)
  // const upperPeriodAboveCriteriaPer = percentageOf(trades.length, tradesUpperPeriodCriteria)
  // console.log(`trades upper p above criteria ... ${upperPeriodAboveCriteriaPer}`)

  // const wTradesUpperPeriodCriteria = upperPeriodRateAbove200WMA(winningTrades)
  // const wTradesUpperPeriodCriteriadPerc = percentageOf(
  //   winningTrades.length, wTradesUpperPeriodCriteria
  // )
  // console.log(`winning trades ... ${winningTrades.length}`)
  // console.log(`w trades upper p criteria ... ${wTradesUpperPeriodCriteriadPerc}`)

  // const lTradesUpperPeriodCriteria = upperPeriodRateAbove200WMA(losingTrades)
  // const lTradesUpperPeriodCriteriaPerc = percentageOf(
  //   losingTrades.length, lTradesUpperPeriodCriteria
  // )

  // console.log(`losing trades .. ${losingTrades.length}`)
  // console.log(`l trades upper p criteria ... ${lTradesUpperPeriodCriteriaPerc}`)

  const performance = percentage(totalWinningPips, totalLosingPips * -1)

  
  return {
    stopLoss,
    takeProfit: stopGain,
    trades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winPercentage: percentage(winningTrades.length, losingTrades.length),
    wAvgPips,
    lAvgPips,
    pips,
    pipsPerTrade: pips / trades.length,
    avgDuration: tradesAvgDuration(trades),
    tradesPerDay,
    costPerDay,
    pipsPerDay,
    netPipsPerDay: pipsPerDay - costPerDay,
    totalWinningPips,
    totalLosingPips: totalLosingPips * -1,
    performance,
    shortPerformance: 100 - performance
  }
}

const getWinningTrades = trades => trades.filter((x) => x.open.rate < x.close.rate)

const getLosingTrades = trades => trades.filter((x) => x.open.rate > x.close.rate)

const getRelatedUpperTrade = trade => upperPeriods => {
  const earlierPeriods = upperPeriods.filter((x) => new Date(x.date) <= new Date(trade.open.date))

  return earlierPeriods[earlierPeriods.length - 1]
}

const upperPeriodMacdAbove = (trades) => trades.reduce((sum, x) => 
  sum + (x.upperPeriod.macd.macdHistogram > 0 ? 1 : 0), 0
)
const upperPeriodMacdBelow = (trades) => trades.reduce((sum, x) =>
  sum + (x.upperPeriod.macd.macdHistogram < 0 ? 1 : 0), 0
)


const upperPeriodMacdSame = (trades) => {
  return trades.reduce((sum, x) => {
    return sum + (x.upperPeriod.macdHistogram === 0 ? 1 : 0)
  }, 0)
}

const upperPeriodRateAbove200WMA = (trades) => {
  return trades.reduce((sum, x) => {
    return sum +  (x.upperPeriod.rate > x.upperPeriod.wma[100] ? 1 : 0)
  }, 0)
}