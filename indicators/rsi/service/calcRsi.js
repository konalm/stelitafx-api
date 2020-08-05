module.exports = (candles) => {
  const totalGain = candles.reduce((acc, x) => x.close > x.open 
    ? acc + x.close - x.open 
    : acc + 0.00 
  , 0)
  const totalLoss = candles.reduce((acc, x) => x.close < x.open 
    ? acc + x.open - x.close
    : acc + 0.00
  , 0)

  // console.log(`total gain .. ${totalGain}`)
  // console.log(`total loss .. ${totalLoss}`)
  // console.log(`candles .. ${candles.length}`)
  // console.log()
  
  
  const avgGain = totalGain / candles.length
  const avgLoss = totalLoss / candles.length 

  // console.log(`avg gain .. ${avgGain}`)
  // console.log(`avg loss .. ${avgLoss}`)
  // console.log()

  const rs = avgGain / avgLoss

  return 100 - (100 / (1 + rs))
}
