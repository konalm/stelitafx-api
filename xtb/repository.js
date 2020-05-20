const db = require('@/dbInstance')


exports.storeTradeTransaction = (transaction) => new Promise((resolve, reject) => {
  const conn = db()

  console.log('xtb .. store transaction')

  const query = 'INSERT INTO xtb_trade_transactions SET ?'
  const data = {
    trade_id: transaction.order,
    json: JSON.stringify(transaction)
  }
  conn.query(query, data, (e) => {
    conn.end()

    if (e) return reject('Failed to insert xtb trade transaction')
    resolve()
  })
})


exports.storeCloseTradeTransaction = (transaction) => new Promise((resolve, reject) => {
  const conn = db()
  console.log('xtb .. store transaction')

  const query = 'INSERT INTO xtb_trade_transactions SET ?'
  const data = {
    trade_id: transaction.status.order,
    json: JSON.stringify(transaction)
  }
  conn.query(query, data, (e) => {
    conn.end()

    if (e) return reject('Failed to insert xtb trade transaction')
    resolve()
  })
})


exports.storeTradeRel = (tradeUUID, xtbTradeId) => new Promise((resolve, reject) => {
  const conn = db()

  console.log('xtb repo .. store trade rel')
  console.log(`trade UUID .. ${tradeUUID}`)
  console.log(`xtb trade id .. ${xtbTradeId}`)

  const query = "INSERT INTO trade_xtbtrade_rel SET ?"
  const queryValues = {
    trade_uuid: tradeUUID,
    xtb_opentrade_id: xtbTradeId
  }
  conn.query(query, queryValues, (e) => {
    conn.end()

    if (e) return reject(`Failed to store xtb trade relationship: ${e}`)
    resolve()
  })
})


exports.updateTradeRel = (tradeUUID, xtbTradeId) => new Promise((resolve, reject) => {
  const conn = db()

  console.log('update trade rel')
  console.log(tradeUUID)
  console.log(xtbTradeId)

  const query = "UPDATE trade_xtbtrade_rel SET xtb_closetrade_id = ? WHERE trade_uuid = ?"
  const queryValues = [xtbTradeId, tradeUUID]
  conn.query(query, queryValues, (e) => {
    conn.end()

    if (e) return reject(`Failed to update xtb trade relationship: ${e}`)
    resolve()
  })
})


exports.getTradeRel = (tradeUUID) => new Promise((resolve, reject) => {
  const conn = db()

  console.log('get trade rel')

  const query = `
    SELECT xtb_opentrade_id AS xtbOpenTradeId, 
      xtb_closetrade_id AS xtbCloseTradeId
    FROM trade_xtbtrade_rel
    WHERE trade_uuid = ?
  `
  const queryValues = [tradeUUID]
  conn.query(query, queryValues, (e, results) => {
    conn.end()

    console.log(e)
    console.log(results)

    if (e) return reject(`Failed to get xtb trade relationship: ${e}`)
    if (results.length === 0) reject('Could not find xtb trade relationship')

    resolve(results[0])
  })
})


/**
 * Get all historic trades
 */
exports.getHistoricTrades = () => new Promise((resolve, reject) => {
  const conn = db()

  const query = `
    SELECT id, 
    order_no AS orderNo,
    order2_no AS order2No
    FROM xtb_historic_trade
  `
  conn.query(query, (e, results) => {
    conn.end()

    if (e) return reject('Failed to get xtb historic trades')

    return resolve(results)
  })
})


/**
 * 
 */
exports.storeHistoricTrades = (trades) => new Promise((resolve, reject) => {
  const conn = db()
  const query = 'INSERT INTO xtb_historic_trade (order_no, order2_no, json) VALUES ?'

  const queryValues = []
  trades.forEach((x) => {
    const row = [x.order, x.order2, JSON.stringify(x)]
    queryValues.push(row)
  })

  conn.query(query, [queryValues], (e, results) => {
    conn.end()
    
    if (e) return reject('Failed to insert historic trades')
    resolve(results)
  })
})