const repository = require('./repository')
const { getTradeV2 } = require('../trade/repository')


exports.getStochastics = async (req, res) => {
  const { abbrev, interval } = req.params
  const currencyPairAbbrev = `${abbrev}/USD`
  const { count } = req.query || 50
  const { offset } = req.query || 0

  console.log('get stochastics !!')
  console.log(`count .. ${count}`)
  console.log(`offset ... ${offset}`)

  let stochastics;
  try {
    stochastics = await repository.getStochastics(
      currencyPairAbbrev, 
      interval, 
      count, 
      offset
    )
  } catch (e) {
    console.log('FAIL :(')
    console.log(e)
    return res.status(500).send('Failed to get stochastics')
  }

  return res.send(stochastics)
}


exports.getStochasticForTrade = async (req, res) => {
  console.log('get stochastic for trade')

  const abbrev = `${req.params.currency}/USD`
  const tradeId = req.params.tradeId

  let trade
  try {
    trade = await getTradeV2(abbrev, tradeId)
  } catch (e) {
    return res.status(500).send('Failed to get trade')
  }
  if (!trade) return res.status(404).send('could not find trade')

  console.log(trade)

  let stochastics
  try {
    stochastics = await repository.getStochasticsBetweenDates(
      abbrev,
      trade.timeInterval,
      trade.openDate,
      trade.closeDate,
      40
    )
  } catch (e) {
    return res.status(500).send('Failed to get stochastics')
  }

  return res.send(stochastics)
}
