const calcOBC = require('./calculate')

module.exports = (periods, index) => {
  if (index === 0) return 

  const amount = 50
  const length = periods.length < amount ? periods.length : amount

  const relevantCandles = [...periods]
    .splice(index - length + 0, length)
    .map((x) => ({
      volume: x.volume,
      close: x.candle.x
    }))
  
  return calcOBC(relevantCandles)
}