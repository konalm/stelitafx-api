const calculatePips = require('./calculatePip')

/**
 * Grab prices from open and close transactions from XTB and calculate 
 * the difference in pips
 */
module.exports = (openTransactionJson, closeTransactionJson ) => {
  if (!openTransactionJson || !closeTransactionJson) return 0

  const openTransaction = JSON.parse(openTransactionJson)
  const closeTransaction = JSON.parse(closeTransactionJson)

  if (!closeTransaction) return null
  if (!closeTransaction.hasOwnProperty('status')) return null

  const openPrice = openTransaction.ask
  const closePrice = closeTransaction.status.bid

  return calculatePips(openPrice, closePrice)
}