const fs = require('fs')
const DIR = 'cache/macd'


module.exports = (interval, abbrev, data) => new Promise(async (resolve, reject) => {
  /* create dir for interval if it does not exists */ 
  const intervalDir = `${DIR}/${interval}`
  if (!fs.existsSync(intervalDir)) await fs.mkdirSync(intervalDir)

  const symbol = abbrev.replace("/", "")
  const filename = `${intervalDir}/${symbol}.JSON`

  let cachedMacd
  try {
    cachedMacd = JSON.parse(await (fs.readFileSync(filename, 'utf8')))
  } catch (e) {
    console.error(`Failed to reach cached macd from: ${filename}`)
  }

  if (!cachedMacd) cachedMacd = []

  const newMacd = {
    date: new Date(),
    interval,
    abbrev,
    settings: JSON.parse(data.settings),
    macd: JSON.parse(data.macd)
  }
  cachedMacd.push(newMacd)

  if (cachedMacd.length > 500) cachedMacd.shift()

  try {
    await fs.writeFileSync(filename, JSON.stringify(cachedMacd))
  } catch (e) {
    return reject(`Faield to write macd to ${filename}`)
  }

  resolve()
})