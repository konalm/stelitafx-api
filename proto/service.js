const compose = require('@/services/compose');
const pipCalc = require('@/services/calculatePip');
const { percentage } = require('@/services/utils');
const tradeRepo = require('@/trade/repository');

/**
 * 
 */
exports.algorithmsPerformanceSummary = performances => {
  const tradeAmount = performances.reduce((sum, x) => sum + x.tradeAmount, 0)
  const winningTrades = performances.reduce((sum, x) => sum + x.trades.winning, 0)
  const losingTrades = performances.reduce((sum, x) => sum + x.trades.losing, 0)
  const pips = performances.reduce((sum, x) => sum + x.pips.total, 0)
  const pipsGained = performances.reduce((sum, x) => sum + x.pips.winning, 0)
  const pipsLost = performances.reduce((sum, x) => sum + x.pips.losing, 0)

  return {
    tradeAmount,
    pips,
    trades: {
      winning: winningTrades,
      losing: losingTrades,
      winPercent:  percentage(winningTrades, losingTrades)
    },
    pips: {
      total: pips,
      winning: pipsGained,
      losing: pipsLost
    },
    avg: {
      total: pips / tradeAmount,
      winning: pipsGained / winningTrades || 0,
      losing: pipsLost / losingTrades || 0
    }
  }
}

/**
 * 
 */
exports.getAlgorithmTradesPerformances = prototypeNo => interval => sinceDate =>
  new Promise(async (resolve, reject) => 
{
  const tradeConditions = {
    proto_no: parseInt(prototypeNo),
    time_interval: interval,
    closed: true
  }
  let trades 
  try {
    trades = await tradeRepo.getTrades(tradeConditions, sinceDate)
  } catch (e) {
    console.log(e)
    return null
  }

  console.log(`trades ... ${trades.length}`)

  resolve(this.getAlgorithmPerformance(trades))
})

/**
 * 
 */
exports.getAlgorithmPerformance = trades => {
  const pips = totalPips(trades)

  const tradeAmount = trades.length
  const winningTrades = getWinningTrades(trades)
  const losingTrades = getLosingTrades(trades)
  const pipsGained = getPipsGained(trades)
  const pipsLost = getPipsLost(trades)

  return {
    tradeAmount,
    pips,
    trades: {
      winning: winningTrades.length,
      losing: losingTrades.length,
      winPercent:  percentage(winningTrades.length, losingTrades.length)
    },
    pips: {
      total: pips,
      winning: pipsGained,
      losing: pipsLost * -1
    },
    avg: {
      total: pips / tradeAmount,
      winning: pipsGained / winningTrades.length || 0,
      losing: pipsLost * -1 / losingTrades.length || 0
    }
  }
}

const totalPips = trades => trades.reduce((sum, x) => {
  const pips = pipCalc(x.openRate, x.closeRate, x.abbrev)
  return sum + (x.transactionType === 'short' ? pips * -1 : pips)
}, 0)

const getWinningTrades = trades => trades.filter((x) => 
  (x.transactionType === 'short' && x.openRate > x.closeRate) ||
  (x.transactionType === 'long' && x.openRate < x.closeRate)
)

const getLosingTrades = (trades) => trades.filter((x) => 
  (x.transactionType === 'long' && x.openRate > x.closeRate) ||
  (x.transactionType === 'short' && x.openRate < x.closeRate)
)

const getPipsGained = compose(totalPips, getWinningTrades)
const getPipsLost = compose(totalPips, getLosingTrades)
