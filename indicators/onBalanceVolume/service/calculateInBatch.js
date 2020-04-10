const calcOBC = require('./calculate')

module.exports = (periods, index) => {
  if (index === 0) return 

  const amount = 100
  const length = periods.length < amount ? periods.length : amount

  const relevantCandles = [...periods]
    .splice(index - length + 1, length)
    .map((x) => ({
      volume: x.volume,
      close: parseFloat(x.candle.c)
    }))
    
  return calcOBC(relevantCandles)
}