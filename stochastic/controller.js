const repository = require('./repository')


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

