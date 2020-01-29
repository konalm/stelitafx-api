const conn = require('../db')


exports.storeTradeTransaction = (transaction) => new Promise((resolve, reject) => {
  const query = 'INSERT INTO xtb_trade_transactions SET ?'
  const data = {
    trade_id: transaction.order2,
    transaction: JSON.stringify(transaction)
  }
  conn.query(query, data, (e) => {
    if (e) return reject('Failed to insert xtb trade transaction')

    resolve()
  })
})


exports.storeTradeRel = (tradeUUID, xtbTradeId) => new Promise((resolve, reject) => {
  const query = "INSERT INTO trade_xtbtrade_rel SET ?"
  const queryValues = {
    trade_uuid: tradeUUID,
    xtb_opentrade_id: xtbTradeId
  }
  conn.query(query, queryValues, (e) => {
    if (e) return reject(`Failed to store xtb trade relationship: ${e}`)

    resolve()
  })
})


exports.updateTradeRel = (tradeUUID, xtbTradeId) => new Promise((resolve, reject) => {
  const query = "UPDATE trade_xtbtrade_rel SET xtb_closetradeId = ? WHERE tradeUUID = ?"
  const queryValues = [xtbTradeId, tradeUUID]
  conn.query(query, queryValues, (e) => {
    if (e) return reject(`Failed to update xtb trade relationship: ${e}`)

    resolve()
  })
})