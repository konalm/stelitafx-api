module.exports = (s, filters) => {
  const { minTrades, pipsPerTrade, worstPipsPerTrade, winPer, worstWinPer } = filters
  let stats = [...s]

  if (minTrades) stats = stats.filter((x) => x.trades >= minTrades)
  if (pipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade > pipsPerTrade)
  if (worstPipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade < worstPipsPerTrade * -1)
  if (winPer) stats = stats.filter((x) => x.winPercentage > winPer)
  if (worstWinPer) stats = stats.filter((x) => x.winPercentage < worstWinPer)

  return stats
}