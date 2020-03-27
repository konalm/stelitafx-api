const { getAdx, getAdxItemsBetweenDates } = require('./repository')
const tradeRepo = require('@/trade/repository');


exports.getAdx = async (req, res) => {
  const { interval, currency } = req.params
  const abbrev = `${currency}/USD`
  const count = parseInt(req.params.count)
  const offset = parseInt(req.query.offset) || 0;
  
  let adx
  try {
    adx = await getAdx(interval, abbrev, count, offset)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get adx')
  }

  return res.send(adx)
}


exports.getAdxItemsForTrade = async (req, res) => {
  const { currency, tradeUUID } = req.params
  const interval = parseInt(req.params.interval)
  const abbrev = `${currency}/USD`
  const buffer = req.query.buffer || 40
  
  let trade
  try {
    trade = await tradeRepo.getTradeV2(abbrev, tradeUUID)
  } catch (e) {
    return res.status(500).send('Failed to get trade')
  }
  if (!trade) return res.status(404).send('Could not find trade')

  let adxItems 
  try {
    adxItems = await getAdxItemsBetweenDates(
      interval, 
      abbrev, 
      trade.openDate, 
      trade.closeDate,
      buffer
    )
  } catch (e) {
    return res.status(500).send('Failed to get adx items')
  }

  return res.send(adxItems)
}