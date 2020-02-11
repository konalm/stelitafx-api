const fs = require('fs')


module.exports = (interval, abbrev, count) => new Promise(async (resolve, reject) => {
  const symbol = abbrev.replace("/", "")
  const path = `cache/WMA/${interval}/${symbol}.JSON`

  let cachedWMA
  try {
    cachedWMA = JSON.parse(await fs.readFileSync(path, 'utf8'))
  } catch (e) {
    return reject('Failed to get cached WMA')
  }
  if (!cachedWMA) return resolve(false)

  if (count > cachedWMA.length) return resolve(false)

  cachedWMA.sort((a, b) => new Date(b.date) - new Date(a.date))
  cachedWMA.splice(count, cachedWMA.length)

  const dataPoints = []
  cachedWMA.forEach((x) => { 
    if (x.WMAData) {
      let dataPoint = {
        date: x.date,
        rate: x.rate,
        WMAs: {}
      };

      x.WMAData.forEach((wmaRow) => {
        dataPoint.WMAs[wmaRow.length] = wmaRow.wma
      });
      dataPoints.push(dataPoint);
    }
  })

  

  resolve(dataPoints)
})