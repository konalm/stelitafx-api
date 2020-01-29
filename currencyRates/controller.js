const repo = require('./repository')
const config = require('../config')
const calculateVolatility = require('../services/calculateVolatility')


exports.getCurrencyRateSources = (_, res) => {
  let sources = config.CURRENCY_RATE_SOURCES

  res.send(sources)
}


exports.getMultiRates = async (_, res) => {
  console.log('currency rates controller .. get multi rates')

  let rates 
  try {
    rates = await repo.getMultiRates()
  } catch (e) {
    return res.status(500).send('Failed to get multi rates')
  }

  return res.send(rates)
}


exports.getXTBRatesFromDate = async (req, res) => {
  console.log('get XTB prices from date !!')

  const abbrev = `${req.params.currency}/USD`
  const { startDate }  = req.params
  const toDate = req.query.toDate ? req.query.toDate : new Date()

  let rates 
  try {
    rates = await repo.getXTBRatesFromDate(abbrev, startDate, toDate)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get XTB rates')
  }

  return res.send(rates)
}

exports.getXTBRates = async (req, res) => {
  console.log('get XTB rates')

  const abbrev = `${req.params.currency}/USD`
  const count = parseInt(req.params.count)
  const offset = parseInt(req.query.offset) || 0

  let rates
  try {
    rates = await repo.getXTBRates(abbrev, count, offset)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get XTB rates')
  }

  return res.send(rates)
}


exports.getVolatility = async (req, res) => {
  console.log('get volatility !!')

  const abbrev = `${req.params.currency}/USD`
  let volatility
  try {
    volatility = await calculateVolatility(abbrev, 20)
  } catch (e) {
    return res.status(500).send('Failed to calculate volatility')
  }

  console.log(`volatility >>>  ${volatility}`)

  return res.send(volatility.toString())
}