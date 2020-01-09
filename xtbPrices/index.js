const cron = require('node-cron')
const getPrices = require('./getPrices')
const db = require('../dbInstance');

cron.schedule('*/5 * * * *', async () => {
  console.log('CRON')
  
  let prices
  try {
    prices = await getPrices()
  } catch (e) {
    return console.error(`Failed to get prices: ${e}`)
  }

  const conn = db()
  const query = 'INSERT INTO xtb_prices(abbrev, bid, ask, spread) VALUES ?'
  const queryValues = []

  prices.forEach((x) => {
    const baseCurrency = x.symbol.substring(0,3)
    const abbrev = `${baseCurrency}/USD`
    
    const row = [abbrev, x.bid, x.ask, x.spreadTable]
    queryValues.push(row)
  })

  console.log('query values >>>>')
  console.log(queryValues)

  conn.query(query, [queryValues], (e, _) => {
    console.log(e)
    if (e) return console.error('Failed to insert xtb price')
  })
  conn.end()
})

