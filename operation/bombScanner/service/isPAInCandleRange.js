module.exports = (PA, candles) => {
  /* highest high */ 
  const high = Math.max(...candles.map((x) => x.high))

  /* lowest low */ 
  const low = Math.min(...candles.map((x) => x.low))

  return PA.high < high && PA.low > low
}