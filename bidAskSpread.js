const axios = require('axios');
const env = require('./env.js')
const db = require('./dbInstance');

const { MAJOR_CURRENCIES } = require('./config.js')
const apiSecret = env.OANDA_LIVE_API_SECRET;
const accountId = env.OANDA_LIVE_ACCOUNT_ID;

const apiUrl = 'https://api-fxtrade.oanda.com/v3/'
const url = `${apiUrl}accounts/${accountId}/pricing?instruments=GBP_USD,EUR_USD,AUD_USD`
const options = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiSecret}`
  }
};

const calcPip = (open, close) => {
  const multiplier = 0.0001

  const pips = Math.round((close - open) / multiplier)
  return parseInt(pips)
}

const insert = (rows) => {
  const conn = db()
  const query = 'INSERT INTO bid_ask_spread(abbrev, bid, ask, bid_ask_spread) VALUES ?'
  conn.query(query, [rows], (e) => {
    if (e) console.error(e)
  
    process.exit()
  })
  conn.end()
}

axios.get(url, options)
  .then((res) => {
    const spreads = res.data.prices

    const rows = []
    MAJOR_CURRENCIES.forEach((x) => {
      const inst = `${x}_USD`
      const spread = spreads.find(x => x.instrument === inst)
      if (!spread) return 

      const bid = parseFloat(spread.bids[0].price)
      const ask = parseFloat(spread.asks[0].price)
      const row = [`${x}/USD`, bid, ask, calcPip(bid, ask)]
      rows.push(row)
    })

    insert(rows)
  })
  .catch((e) => {
    console.log(e)
  })

