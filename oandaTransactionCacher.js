const conn = require('./db')
const Promise = require('bluebird')
const oandaHttp = require('./services/oandaApiHttpRequest')

module.exports = async () => {
  let uncachedTransactionIds
  try {
    uncachedTransactionIds = await getUncachedTransactions()
  } catch (e) {
    console.error(`Failed to get uncached transactions: ${e}`)
    return
  }

  uncachedTransactionIds = uncachedTransactionIds.filter(Boolean)
  uncachedTransactionIds = [...new Set(uncachedTransactionIds)]

  Promise.map(uncachedTransactionIds, transactionId => {
    return new Promise(resolve => {
      uploadTransaction(transactionId)
        .then(() => {
          resolve()
        })
        .catch((e) => {
          console.error(e)
          resolve()
        })
    })
  }, {concurrency: 10})
}

const uploadTransaction = async (tradeId) => {
  let response
  try {
    const path = `/transactions/${tradeId}`
    response = await oandaHttp.get(path)
  } catch (e) {
    throw new Error('Failed to get transaction from Oanda')
  }

  const transaction = response.transaction 

  try {
    await storeTransaction(tradeId, transaction)
  } catch (e) {
    console.log(e)
    throw new Error('Failed to store transaction')
  }
}

const storeTransaction = (tradeId, transaction) => 
  new Promise(async(resolve, reject) => 
{
  let query = 'INSERT INTO oanda_trade_transactions SET ?'
  const data = {
    trade_id: tradeId, 
    json: JSON.stringify(transaction)
  }
  conn.query(query, data, (e) => {
    if (e) return reject('Failed to store transaction')

    resolve()
  })
})

const getUncachedTransactions = () => new Promise(async(resolve, reject) => {
  const query = (column) =>  `
    SELECT trade.${column} AS tradeId,
    transaction.json
    FROM trade_oandatrade trade
    LEFT JOIN oanda_trade_transactions transaction
      ON transaction.trade_id = trade.${column}
    WHERE transaction.json IS NULL;
  `
  const x = (query) => new Promise((resolve) => {
    conn.query(query, (e, results) => {
      if (e) return reject(e)

      resolve(results)
    })
  })

  let results = []
  try {
    results = await Promise.all([
      x(query('oanda_opentrade_id')), 
      x(query('oanda_closetrade_id'))
    ])
  } catch (e) {
    return reject(`Failed to get uncached transactions: ${e}`)
  }

  const r = [...results[0], ...results[1]]

  resolve(r.map(x => x.tradeId))
})