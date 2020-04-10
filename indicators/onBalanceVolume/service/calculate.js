module.exports = (_periods) => {
  const p = [..._periods]
  p.forEach((x, i) => {
    if (i === 0) return x.obc = 0 

    const prior = p[i - 1]

    if (x.close < prior.close) x.obc = prior.obc - x.volume 
    else if (x.close > prior.close) x.obc = prior.obc + x.volume
    else x.obc = 0
  })


  return {
    obc: p[p.length - 1].obc,
    wma: {
      10: calcMovingAverage(p, 10),
      // 20: calcMovingAverage(periods, 20),
      50: calcMovingAverage(p, 50),
      100: calcMovingAverage(p, 100)
    }
  }
}


const calcMovingAverage = (periods, length) =>  {
  if (periods.length < length) return 0

  return [...periods]
    .splice(periods.length - length + 1, length)
    .reduce((sum, x) => sum + x.obc, 0)
    / length
}
