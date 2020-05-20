const compose = require('@/services/compose');
const pipCalc = require('@/services/calculatePip');
const { percentage } = require('@/services/utils');



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
