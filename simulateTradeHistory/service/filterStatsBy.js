module.exports = (s, filters) => {
  const { 
    minTrades, 
    pipsPerTrade, 
    worstPipsPerTrade, 
    winPer, 
    worstWinPer, 
    adxAlgo, 
    threshold,
    tradesPerDay,
    buyTrigger,
    sellTrigger,
    stopLoss,
    stopGain,
    takeProfit,
    month,
    algo,
    openTrigger
  } = filters

  let stats = [...s]

  if (minTrades) stats = stats.filter((x) => x.trades >= minTrades)
  if (pipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade > pipsPerTrade)
  if (worstPipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade < worstPipsPerTrade * -1)
  if (winPer) stats = stats.filter((x) => x.winPercentage > winPer)
  if (worstWinPer) stats = stats.filter((x) => x.winPercentage < worstWinPer)
  if (adxAlgo) stats = stats.filter((x) => x.adxAlgo === adxAlgo)
  if (threshold) stats = stats.filter((x) => x.threshold >= threshold)
  if (tradesPerDay) stats = stats.filter((x) => x.tradesPerDay >= tradesPerDay)
  if (buyTrigger) stats = stats.filter((x) => x.buyTrigger === buyTrigger)
  if (sellTrigger) stats = stats.filter((x) => x.sellTrigger === sellTrigger)
  if (stopGain) stats = stats.filter((x) => x.stopGain === stopGain)
  if (algo) stats = stats.filter((x) => x.algo === algo)
  if (openTrigger) stats = stats.filter((x) => x.openTrigger === openTrigger)
  // stats = stats.filter((x) => x.stopLoss === stopLoss)
  if (takeProfit) stats = stats.filter((x) => x.takeProfit === takeProfit)

  return stats
}