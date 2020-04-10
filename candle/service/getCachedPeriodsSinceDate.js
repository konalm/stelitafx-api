const fs = require('fs')

module.exports = async (abbrev, sinceDate) => {
  let periods 
  try {
    periods = JSON.parse(
      await fs.readFileSync(`../cache/historicCandles/${abbrev}.JSON`)
    )
  } catch (e) {
    throw new Error(e)
  }
  console.log(`total periods ... ${periods.length}`)

  return periods.filter((x) => new Date(x.date) >= new Date(sinceDate))
}