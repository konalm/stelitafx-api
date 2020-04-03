module.exports = (periods) => {
  let onBalanceVolume = 0
  
  periods.forEach((x, i) => {
    if (i === 0) return 

    const priorClose = periods[i - 1].close
    
    if (x.close < priorClose) onBalanceVolume -= close 
    if (x.close > priorClose) onBalanceVolume  += close
  })

  return {
    onBalanceVolume,
    wma: {
      10: calcMovingAverage(periods, 10),
      20: calcMovingAverage(periods, 20),
      50: calcMovingAverage(periods, 50)
    }
  }
}


const calcMovingAverage = (periods, length) => 
  periods.length > length 
    ? relevantPeriods = [...periods]
      .splice(periods.length - 1 - length, length)
      .reduce((sum, x) => sum + x.close)
      / length
    : 0
