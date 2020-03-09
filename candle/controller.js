const { getCandles } = require('./repository')

exports.getCandles = async (req, res) => {
  console.log('get candles !!')

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