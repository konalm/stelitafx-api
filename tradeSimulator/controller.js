const service = require('../services/oanda');
const tradeService = require('../trade/service');
const logger = require('../services/logger');

exports.simulateOandaTrade = (req, res) => {
  const {transaction, currency} = req.params;

  if (transaction === 'open') service.openTrade(currency)
  else if (transaction === 'close') service.closeTrade(currency)
  else return res.status(500).send(`do find recongize transaction ${transaction}`)

  res.send(`${transaction} transaction simulated`)
}


exports.simulateTrade = async (req, res) => {
  const {transaction, protoNo, currency} = req.params;
  const rate = 1.000; 
  const interval = 15;

  logger(`simulate ${transaction} trade`, 'info')
  
  if (transaction === 'open') {
    try {
      await tradeService.openTrade(parseInt(protoNo), currency, rate, '', '', interval)
    } catch (e) {
      logger('Failed to open paper trade', 'danger')
      return res.status(500).send('Failed to simulate open trade')
    }

    logger('SIMULATED OPEN TRADE', 'success')
    return res.send('Simulated open trade')
  }

  if (transaction === 'close') {
    try {
      await tradeService.closeTrade(parseInt(protoNo), currency, rate, '', interval)
    } catch (e) {
      logger('failed to close paper trade', 'danger')
      return res.status(500).send('Failed to simulate close trade')
    }
    logger('closed paper trade', 'success')

    return res.send('Simulated close trade')
  }

  return res.status(500).send('Transaction not recognized')
}
