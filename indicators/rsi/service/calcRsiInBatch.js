const _ = require('lodash')
const calcRsi = require('./calcRsi')

module.exports = (candles, index, length) => {
  if (index < length - 1) return null 

  // console.log(`candles .. ${candles.length}`)

  const indices = []
  for (let i = index - length + 1; i <= index; i++) indices.push(i)
  
  const relevantCandles = indices.map(i => candles[i])

  return {
    date: candles[index].date,
    rsi:  calcRsi(relevantCandles)
  }
}