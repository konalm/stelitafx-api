const fs = require('fs')


module.exports = (interval, abbrev, count) => new Promise(async (resolve, reject) => {
  // console.log(`get cached rates for ... ${abbrev}`)

  const symbol = abbrev.replace("/", "")
  const path = `cache/currencyRate/${interval}/${symbol}.JSON`

  let currencyRates
  try {
    currencyRates = JSON.parse(await fs.readFileSync(path, 'utf8'))
  } catch(e) {
    return reject('Failed to reach currency rates cache')
  }

  if (count > currencyRates.length) return resolve(false)

  
  currencyRates.sort((a, b) => new Date(b.date) - new Date(a.date))
  currencyRates.splice(count, currencyRates.length)

  resolve(currencyRates)
})