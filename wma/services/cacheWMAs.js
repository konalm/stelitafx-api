const fs = require('fs')
const DIR = 'cache/WMA'


module.exports = (interval, abbrev, WMAData, rate) => 
  new Promise(async (resolve, reject) => 
{
  /* create dir for interval if it does not exists */
  const intervalDir = `${DIR}/${interval}`
  if (!fs.existsSync(intervalDir)) await fs.mkdirSync(intervalDir)
  
  const symbol = abbrev.replace("/", "")
  const filename = `${intervalDir}/${symbol}.JSON`
  
  let cachedWMAs
  try {
    cachedWMAs = JSON.parse(await fs.readFileSync(filename, 'utf8'))
  } catch (e) {
    console.error(`Failed to read cached WMAs from: ${filename}`)
  }
  
  if (!cachedWMAs) cachedWMAs = []
  
  const wmaDataSet = { date: new Date(), interval, abbrev, WMAData, rate }

  try {
    cachedWMAs.push(wmaDataSet)
  } catch (e) {
    console.log('Failed to push')
    cachedWMAs = [wmaDataSet]
  }

  if (cachedWMAs.length > 10) cachedWMAs.shift()

  
  try {
    await fs.writeFileSync(filename, JSON.stringify(cachedWMAs))
  } catch (e) {
    return reject(`Failed to write WMA dataset to ${filename}`)
  }

  resolve()
})
