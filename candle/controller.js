const { getCandles, getCandlesBetweenDates } = require('./repository')
const tradeRepo = require('@/trade/repository')
const symbolToAbbrev = require('@/services/symbolToAbbrev')
const getHeikinAshiCandles = require('./service/heikinAshiCandles')
const constructWaveDataPoints = require('./service/constructWaveDataPoints')
const constructWaves = require('./service/constructWaves')
const impulseWaveScanner = require('./service/impulseWave')
const handleGetCandlesRequest = require('./service/handleGetCandlesRequest')
const getCachedCandles = require('./service/getCachedHistoricCandles')
const harmonicPatterns = require('./service/harmonicPattern')
const constructTrends = require('./service/constructTrends')
const constructTrendsV2 = require('./service/constructTrendsV2')
const constructFullWaves = require('./service/constructFullWaves')
const calcRsiInBatch = require('@/indicators/rsi/service/calcRsiInBatch')


/**
 * 
 */
exports.getVolume = async (req, res) => {
  const { gran, symbol } = req.params 
  const count = req.query.count || null
  const offset = req.query.offset || 0
  const candles = await getCachedCandles(gran, symbol, count, offset)
  const volume = candles.map((x) => ({ 
    date: new Date(x.date), 
    volume: x.volume
  }))

  return res.send(volume)
}

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
  
  const heikenAshiCandles = getHeikinAshiCandles(candles)
  const waveDataPoints = constructWaveDataPoints(heikenAshiCandles)
  const waves = constructWaves(waveDataPoints, symbol)
  const impulseWaves = impulseWaveScanner(waves)
  
  return res.send(impulseWaves)
}

/**
 * 
 */
exports.getTrends = async (req, res) => {
  const symbol = req.params.symbol
  const candles = await handleGetCandlesRequest(req.params, req.query)
  const heikenAshiCandles = getHeikinAshiCandles(candles)
  const waveDataPoints = constructWaveDataPoints(heikenAshiCandles)
  const waves = constructWaves (waveDataPoints, symbol)
  const fullWaves = constructFullWaves(waves)
  const trends = constructTrends(fullWaves)
  // const trends = constructTrendsV2(waves)

  return res.send(trends)
}

/**
 * 
 */
exports.scanHarmonicPatterns = async (req, res) => {
  const symbol = req.params.symbol
  const candles = await handleGetCandlesRequest(req.params, req.query)

  // console.log(`candles .. ${candles.length}`)
  
  const heikenAshiCandles = getHeikinAshiCandles(candles)
  const waveDataPoints = constructWaveDataPoints(heikenAshiCandles)
  const waves = constructWaves(waveDataPoints, symbol)

  harmonicPatterns(waves)

  return res.send('scan harmonic patterns')
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
  const candles = await handleGetCandlesRequest(req.params, req.query)

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

/**
 * 
 */
exports.getRsi = async (req, res) => {
  const candles = await handleGetCandlesRequest(req.params, req.query)
  const length = 3

  const rsis = []
  candles.forEach((_, i) => {
    // console.log(`candle .. ${i}`)
    const rsi = calcRsiInBatch(candles, i, length)
    if (rsi) rsis.push(rsi)
  })

  return res.send(rsis)
}
