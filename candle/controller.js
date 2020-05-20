const { getCandles, getCandlesBetweenDates } = require('./repository')
const tradeRepo = require('@/trade/repository')
const symbolToAbbrev = require('@/services/symbolToAbbrev')

exports.getCandles = async (req, res) => {
  console.log('get candles !!!!')

  const { interval, currency } = req.params
  const abbrev = `${currency}/USD`
  const count = parseInt(req.params.count)
  const offset = parseInt(req.query.offset) || 0

  let candles
  try {
    candles = await getCandles(interval, abbrev, count, offset)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get candles')
  }

  return res.send(candles)
}


exports.getCandlesForTrade = async (req, res) => {
  console.log('get candles for trade')

  const { currency, tradeUUID } = req.params 
  const interval = parseInt(req.params.interval)
  const abbrev = symbolToAbbrev(currency)
  const buffer = req.query.buffer || 40

  let trade 
  try {
    trade = await tradeRepo.getTradeV2(abbrev, tradeUUID)
  } catch (e) {
    return res.status(500).send('Failed to get trade')
  }
  if (!trade) return res.status(404).send('Could not find trade')

  let candles 
  try {
    candles = await getCandlesBetweenDates(
      interval,
      abbrev,
      trade.openDate,
      trade.closeDate,
      buffer
    )
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get candles')
  }

  return res.send(candles)
}