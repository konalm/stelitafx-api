const fs = require('fs')
const DIR = 'cache/macd'


module.exports = (interval, abbrev, count) => new Promise(async (resolve, reject) => {
  const symbol = abbrev.replace("/", "")
  const path = `cache/macd/${interval}/${symbol}.JSON`

  if (!fs.existsSync(path)) return resolve([])

  let macds
  try {
    macds = JSON.parse(await fs.readFileSync(path, 'utf8'))
  } catch (e) {
    return reject('Failed to read macds from cache')
  }

  if (count > macds.length) return resolve([])

  macds.sort((a, b) => new Date(b.date) - new Date(a.date))
  macds.splice(count, macds.length)

  resolve(macds)
})