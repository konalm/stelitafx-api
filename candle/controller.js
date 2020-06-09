const { getCandles, getCandlesBetweenDates } = require('./repository')
const tradeRepo = require('@/trade/repository')
const symbolToAbbrev = require('@/services/symbolToAbbrev')
const getHeikinAshiCandles = require('./service/heikinAshiCandles')
const constructWaveDataPoints = require('./service/constructWaveDataPoints')
const constructWaves = require('./service/constructWaves')
const impulseWaveScanner = require('./service/impulseWave')
const handleGetCandlesRequest = require('./service/handleGetCandlesRequest')


/**
 * 
 */
exports.getWaves = async (req, res) => {
  const candles = await handleGetCandlesRequest(req.params, req.query)
  const heikenAshiCandles = getHeikinAshiCandles(candles)


  const waveDataPoints = constructWaveDataPoints(heikenAshiCandles)

  return res.send(waveDataPoints)
}


/**
 * 
 */
exports.scanImpulseWaves = async (req, res) => {
  const symbol = req.params.symbol
  const candles = await handleGetCandlesRequest(req.params, req.query)

  console.log('candles -->')
  console.log(candles[0])
  console.log(candles[candles.length - 1])

  
  const heikenAshiCandles = getHeikinAshiCandles(candles)
  const waveDataPoints = constructWaveDataPoints(heikenAshiCandles)
  const waves = constructWaves(waveDataPoints, symbol)
  const impulseWaves = impulseWaveScanner(waves)
  
  console.log('data points -->')
  console.log(waveDataPoints[0])
  console.log(waveDataPoints[waveDataPoints.length - 1])

  return res.send(impulseWaves)
}


/**
 * 
 */
exports.getHeikenAshiCandles = async (req, res) => {
  const candles = await handleGetCandlesRequest(req.params, req.query)
  const heikenAshiCandles = getHeikinAshiCandles(candles)

  return res.send(heikenAshiCandles)
}


exports.getCandles = async (req, res) => {
  const { interval, currency } = req.params
  const count = parseInt(req.params.count)
  const offset = parseInt(req.query.offset) || 0
  const abbrev = symbolToAbbrev(currency)
  const candles = await getCandles(interval, abbrev, count, offset)

  return res.send(candles)
}


exports.getCandlesForTrade = async (req, res) => {
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