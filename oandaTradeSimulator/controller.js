const service = require('../services/oanda');

exports.simulateTrade = (req, res) => {
  const {transaction, currency} = req.params;
  const abbrev = `${currency}/USD`

  if (transaction === 'open') service.openTrade(currency)
  else if (transaction === 'close') service.closeTrade(currency)
  else return res.status(500).send(`do find recongize transaction ${transaction}`)

  res.send(`${transaction} transaction simulated`)
}