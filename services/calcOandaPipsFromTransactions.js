const calculatePips = require('./calculatePip')

/**
 * Grab prices from open and close transactions from Oanda and calculate 
 * the difference in pips
 */
module.exports = (openTransactionJson, closeTransactionJson ) => {
  if (!openTransactionJson || !closeTransactionJson) return 0

  const openTransaction = JSON.parse(openTransactionJson)
  const closeTransaction = JSON.parse(closeTransactionJson)

  const openPrice = openTransaction.price
  const closePrice = closeTransaction.price

  return calculatePips(openPrice, closePrice)
}