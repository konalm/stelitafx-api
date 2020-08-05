const fs = require('fs')

module.exports = async (gran, symbol, count, offset) => {
  const filePath = `cache/historicCandles/${gran}/${symbol}.JSON`
  const candles = JSON.parse(await fs.readFileSync(filePath, 'utf8'))

  if (offset) candles.splice(candles.length - offset, offset)
  if (count) candles.splice(0, candles.length - count)
  
  return candles
}