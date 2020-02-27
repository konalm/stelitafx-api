const fs = require('fs')
const DIR = 'cache/candle'

module.exports = (interval, abbrev, data) => new Promise(async (resolve, reject) => {
  /* create dir for interval if it does not exists */ 
  const intervalDir = `${DIR}/${interval}`
  if (!fs.existsSync(intervalDir)) await fs.mkdirSync(intervalDir)

  const symbol = abbrev.replace("/", "")
  const filename = `${intervalDir}/${symbol}.JSON`

  let cachedCandles
  try {
    cachedCandles = JSON.parse(await fs.readFileSync(filename, 'utf8'))
  } catch (e) {
    console.error(`Failed to read cached candles from: ${filename}`)
  }

  if (!cachedCandles) cachedCandles = []

  const newCandle = {
    date: new Date(),
    interval,
    abbrev,
    open: data.o,
    low: data.l,
    high: data.h,
    close: data.c
  }
  cachedCandles.push(newCandle)

  if (cachedCandles.length > 500) cachedCandles.shift()

  try {
    await fs.writeFileSync(filename, JSON.stringify(cachedCandles))
  } catch (e) {
    return reject(`Failed to write candle to ${filename}`)
  }

  resolve()
})