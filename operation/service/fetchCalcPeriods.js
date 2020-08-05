const fs = require('fs')

module.exports = async (gran, abbrev, sinceDate) => {
  console.log('fetch calc periods')

  const historicCandles = false 

  let path 
  if (!historicCandles) {
    path = gran.includes('H') ? 'calculatedPeriods' : 'calculatedPeriods/withRelatedUpper'
  } else {
    path = 'historicCandles'
  }

  // path = 'calculatedPeriods'

  console.log(path)


  let periods
  try {
    const filePath = `../../cache/${path}/${gran}/${abbrev}.JSON`
    periods = JSON.parse(await fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    return console.error(e)
  }

  return periods
    .filter((x) => new Date(x.date) >= new Date(sinceDate))
    .map((x) => ({
      ...x,
      rate: x.exchange_rate
    }))
}