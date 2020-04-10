module.exports = (trades) => trades.reduce((winningTrades, x) => 
  winningTrades + (x.close.exchange_rate > x.open.exchange_rate ? 1 : 0), 0
)
