const repo = require('./repository')
const config = require('../config')

exports.getCurrencyRateSources = (_, res) => {
  let sources = config.CURRENCY_RATE_SOURCES

  res.send(sources)
}

exports.getMultiRates = async (_, res) => {
  let rates 
  try {
    rates = await repo.getMultiRates()
  } catch (e) {
    return res.status(500).send('Failed to get multi rates')
  }

  return res.send(rates)
}