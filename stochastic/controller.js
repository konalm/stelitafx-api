const repository = require('./repository')
const { getTradeV2 } = require('../trade/repository')
const symbolToAbbrev = require('@/services/symbolToAbbrev')

exports.getStochastics = async (req, res) => {
  console.log('get stochastics !!')

  const { abbrev, interval } = req.params
  const currencyPairAbbrev = `${abbrev}/USD`
  const { count } = req.query || 50
  const { offset } = req.query || 0

  let stochastics;
  try {
    stochastics = await repository.getStochastics(
      currencyPairAbbrev, 
      interval, 
      parseInt(count), 
      parseInt(offset)
    )
  } catch (e) {
    // console.log(e)
    return res.status(500).send('Failed to get stochastics')
  }

  return res.send(stochastics)
}


exports.getStochasticForTrade = async (req, res) => {
  console.log('get stochastic for trade')

  const { currency, tradeUUID } = req.params
  const interval = parseInt(req.params.interval)
  const abbrev = symbolToAbbrev(currency)
  const buffer = req.query.buffer || 40

  let trade
  try {
    trade = await getTradeV2(abbrev, tradeUUID)
  } catch (e) {
    return res.status(500).send('Failed to get trade')
  }
  if (!trade) return res.status(404).send('could not find trade')


  let stochastics
  try {
    stochastics = await repository.getStochasticsBetweenDates(
      abbrev,
      interval,
      trade.openDate,
      trade.closeDate,
      buffer
    )
  } catch (e) {
    return res.status(500).send('Failed to get stochastics')
  }

  return res.send(stochastics)
}
