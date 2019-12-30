const service = require('../services/oanda');
const tradeService = require('../trade/service');
const logger = require('../services/logger');
const tradeRepo = require('../trade/repository');


exports.simulateTrade = async (req, res) => {
  const { transaction, currency } = req.params
  const protoNo = 99
  const interval = 1
  const rate = 1.000

  logger(`simulate ${transaction} trade`, 'info')
  
  if (transaction === 'open') {
    try {
      await tradeService.openTrade(protoNo, currency, rate, '', '', interval)
    } catch (e) {
      console.log(e)
      logger('Failed to open paper trade', 'danger')
      return res.status(500).send('Failed to simulate open trade')
    }

    logger('SIMULATED OPEN TRADE', 'success')
    return res.send('Simulated open trade')
  }

  let openingTrade;
  try {
    const abbrev = `${currency}/USD`
    openingTrade = await tradeRepo.getLastTrade(protoNo, interval, abbrev)
  } catch (e) {
    return res.status(500, 'Failed to simulate trade')
  }

  console.log('opening trade ....')
  console.log(openingTrade)

  if (transaction === 'close') {
    try {
      await tradeService.closeTrade(protoNo, currency, rate, '', interval, openingTrade)
    } catch (e) {
      console.log(e)
      logger('failed to close trade', 'danger')
      return res.status(500).send('Failed to simulate close trade')
    }
    logger('closed paper trade', 'success')

    return res.send('Simulated close trade')
  }

  return res.status(500).send('Transaction not recognized')
}
