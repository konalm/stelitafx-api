const fs = require('fs')

module.exports = (interval, abbrev, count) => 
  new Promise(async (resolve, reject) => 
{
  const symbol = abbrev.replace("/", "")
  const path = `cache/candle/${interval}/${symbol}.JSON`

  let candles
  try {
    candles = JSON.parse(await fs.readFileSync(path, 'utf8'))
  } catch (e) {
    return reject('Failed to read candle cache')
  }

  if (count > candles.length) return resolve([])

  candles.sort((a, b) => new Date(b.date) - new Date(a.date))
  candles.splice(count, candles.length)
  candles = candles.map((x) => ({
    date: x.date,
    abbrev: x.abbrev,
    open: parseFloat(x.open),
    low: parseFloat(x.low),
    high: parseFloat(x.high),
    close: parseFloat(x.close)
  }))

  resolve(candles)
})

1.11664