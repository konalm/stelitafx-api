module.exports = (trades) => trades.reduce((losingTrades, x) => 
  losingTrades + (x.close.exchange_rate < x.open.exchange_rate ? 1 : 0), 0
)
