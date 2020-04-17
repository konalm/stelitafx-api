const fs = require('fs')
const { getCurrencyRatesSinceDate } = require('@/currencyRates/repository')
const calcWmaInBatch = require('@/indicators/wma/service/calcWmaInBatch')
const calcStochasticInBatch = require('@/indicators/stochastic/service/calcStochasticInBatch')
const calculatePip = require('@/services/calculatePip');
const minsBetweenDates = require('@/services/minsBetweenDates')
const service = require('./service')
const triggerConditions = require('./service/conditions')
const { daysBetweenDates } = require('@/services/utils');
const candlePatterns = require('./service/candlePatterns')
const sortStatsBy = require('./service/sortStatsBy')


exports.simulateTradeHistory = async (req, res) => {
  const stopLoss = 10
  const stopGain = null
  
  let currencyRates 
  try {
    currencyRates = JSON.parse(await fs.readFileSync('cache/calculatedPeriods.JSON'))
  } catch (e) {
    return res.status(500).send('Failed to get currency rates')
  }

  const daysOfPeriods = daysBetweenDates(currencyRates[0].date)(new Date())
  
  const trades = []
  
  const periods = [...currencyRates]
  periods.forEach((x, i) => {
    const prior = i > 0 ? periods[i - 1] : null
    const lastTrade = trades.length ? trades[trades.length - 1] : null
    const trigger = triggerConditions.wmaCrossover(prior, x, 195, 200)

    // const trigger = triggerConditions.twentyCrossunderTwoHundredWMA(prior, x)
    // const trigger = triggerConditions.tenCrossoverOneHundreddWMA(prior, x)
    // const trigger = triggerConditions.stochasticTwentyEighty(prior, x)
    // const trigger = triggerConditions.wmaConjoinedStochastic(prior, x)

    /* only check if trade opened if last trade has been closed */ 
    if (!lastTrade || lastTrade.close) {
      if (trigger.openConditions ) trades.push({ open: x, close: null })
      return
    } 
    
    /* if stop loss, check if triggered */ 
    if (stopLoss) {
      if (calculatePip(lastTrade.open.exchange_rate, x.exchange_rate) <= stopLoss * -1) {
        lastTrade.close = { ...x, triggeredStopLoss: true, triggeredStopGain: false }
      }
    }

    /* if stop gain, check if triggered */
    if (stopGain) {
      if (calculatePip(lastTrade.open.exchange_rate, x.exchange_rate) >= stopGain) {
        lastTrade.close = { ...x, triggeredStopLoss: false, triggeredStopGain: true }
      }
    }
    
    if (trigger.closeConditions) {
      lastTrade.close = { ...x, triggeredStopLoss: false, triggeredStopGain: false }
    }
  })

  const closedTrades = trades.filter((x) => x.close)

  closedTrades.forEach((x) => {
    x.stats = {
      pips: calculatePip(x.open.exchange_rate, x.close.exchange_rate),
      duration: minsBetweenDates(x.open.date, x.close.date),
      triggeredStopLoss: false,
      triggeredStopGain: false
    }
    
    x.open.wma = { '20': x.open.wma[20], '200': x.open.wma[200] }
    x.close.wma = { '20': x.open.wma[20], '200': x.open.wma[200] }
  })

  const pipsGained = closedTrades.reduce((sum, x) => 
    sum + (x.stats.pips > 0 ? x.stats.pips : 0), 0
  )
  const pipsLost = closedTrades.reduce((sum, x) => 
    sum + (x.stats.pips < 0 ? x.stats.pips * -1 : 0), 0
  )
  const totalPips = pipsGained - pipsLost
  
  return res.send({
    stats: {
      pipsGained,
      pipsLost,
      totalPips,
      trades: trades.length,
      tradesPerDay: trades.length / daysOfPeriods,
      pipsPerTrade: totalPips / trades.length
    },

    trades: closedTrades
  })
}


exports.wmaTradeHistorySimulator = async (req, res) => {
  const interval = req.params.interval, abbrev = `${req.params.currency}/USD`
  const sinceDate = req.query.since || null;
  const rangeSettings = { min: 1, max: 10 }
  const stopSettings = {
    loss: { min: 1, max: 25 },
    gain: { min: 1, max: 25 }
  }

  const updateCache = false
  if (updateCache) {
    try {
      await service.updateSimulatedPeriodsCache(interval, abbrev, sinceDate, rangeSettings)
    } catch (e) {
      return res.status(500).send(e)
    }

    return res.send('Cache updated !')
  }

  let periods
  try {
    periods = await service.getCachedCalcPeriods()
  } catch (e) {
    return res.status(500).send('Failed to get cached calculated periods')
  }

  const wmaPerformances = []

  /* loop over every fast wma */
  for (let fastWma = rangeSettings.min; fastWma < rangeSettings.max; fastWma ++) {
    console.log(`fast wma ... ${fastWma}`)

    const slowWmaPerformances = service.getWmaPerformances(
      fastWma, periods, rangeSettings.max, stopSettings
    )
    
    const wmaPerformance = { 
      fastWma, 
      slowWmas: slowWmaPerformances,
      stats: service.wmaPerformanceItemStats(slowWmaPerformances)
    }

    wmaPerformances.push(wmaPerformance)
  }

  return res.send({
    stats: service.wmaPerformanceStats(wmaPerformances), 
  })
}


exports.stochasticTradeHistorySimulator = async (req, res) => {
  const interval = req.params.interval, abbrev = `${req.params.currency}/USD`
  const sinceDate = req.query.since || null;

  /* Get currency rates from the DB */
  let currencyRates;
  try {
    currencyRates = await getCurrencyRatesSinceDate(interval, abbrev, sinceDate);
  } catch (e) {
    return res.status(500).send('Failed to get currency rates');
  }

  let periods = [...currencyRates]
  periods.forEach((x, i) => {
    x.stochastic = calcStochasticInBatch(currencyRates, i)
  })

  const validPeriods = periods.filter((x) => x.stochastic)

  return res.send(validPeriods)
}


exports.getStochasticStats = async (req, res) => {
  const sortBy = req.query.sortBy || null
  const minTrades = req.query.minTrades || null
  const abbrev = req.params.abbrev
  const pipsPerTrade = parseFloat(req.query.pipsPerTrade) || null 
  const worstPipsPerTrade = parseFloat(req.query.worstPipsPerTrade) || null

  let stats
  try {
    stats = await JSON.parse(fs.readFileSync(`cache/stats/stochastic/${abbrev}.JSON`, 'utf8'))
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to read stats')
  }
  stats = stats.filter((x) => x.trades > 0)

  stats.forEach((s) => {
    const c = s.tradesPerDay * 0.2 
    s.shortNetPipsPerDay = s.pipsPerDay + c
  })

  if (minTrades) stats = stats.filter((x) => x.trades >= minTrades)
  if (pipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade > pipsPerTrade)
  if (worstPipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade < worstPipsPerTrade * -1)
  if (sortBy) return res.send(sortStatsBy(stats, sortBy).splice(0, 100))

  return res.send(stats.splice(0, 1000))
}


exports.getRateAboveWmaStochasticStats = async (req, res) => {
  const sortBy = req.query.sortBy || null 
  const abbrev = req.params.abbrev;
  const minTrades = req.query.minTrades || 0
  const pipsPerTrade = parseFloat(req.query.pipsPerTrade) || null
  const winPer = parseFloat(req.query.winPer) || null
  const worstWinPer = parseFloat(req.query.worstWinPer) || null
  const dir = 'cache/stats/rateAboveWmaStochastic'
  const worstPipsPerTrade = parseFloat(req.query.worstPipsPerTrade) || null

  let stats
  try {
    stats = await JSON.parse(fs.readFileSync(`${dir}/${abbrev}.JSON`, 'utf8'))
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to read stats')
  }

  stats = stats.filter((x) => x.trades > 0)

  stats.forEach((s) => {
    const c = s.tradesPerDay * 0.2 
    s.shortNetPipsPerDay = s.pipsPerDay + c
  })

  if (minTrades) stats = stats.filter((x) => x.trades >= minTrades)

  if (pipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade > pipsPerTrade)
  if (worstPipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade < worstPipsPerTrade * -1)
  if (winPer) stats = stats.filter((x) => x.winPercentage > winPer)
  if (worstWinPer) stats = stats.filter((x) => x.winPercentage < worstWinPer)

  if (sortBy) return res.send(sortStatsBy(stats, sortBy).splice(0, 100))

  return res.send(stats.splice(0,1000))
}


exports.getWmaCrossedOverStochasticStats = async (req, res) => {
  const sortBy = req.query.sortBy || null 
  const minTrades = req.query.minTrades || null
  // const dir = 'cache/stats/wmaCrossedOverStochastic'
  // const algoStatFiles = await fs.readdirSync(dir)
  const abbrev = req.params.abbrev

  // let stats = []
  // for (let i=0; i<algoStatFiles.length; i++) {
  //   const algo = algoStatFiles[i]

  //   const algoStats = JSON.parse(await fs.readFileSync(`${dir}/${algo}`))
  //   algoStats.forEach((x) => {
  //     x.algorithm = algo.replace('.JSON', '')
  //   })

  //   stats.push(...algoStats)
  // }

  let stats
  try {
    stats = await JSON.parse(fs.readFileSync(`cache/stats/wmaCrossedOverStochastic/${abbrev}.JSON`, 'utf8'))
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to read stats')
  }

  if (sortBy) return res.send(sortStatsBy(stats, sortBy).splice(0, 100))

  return res.send(stats)
}


exports.getWmaCrossedOverStats = async (req, res) => {
  const abbrev = req.params.abbrev
  const sortBy = req.query.sortBy || null 
  const pipsPerTrade = req.query.pipsPerTrade
  const worstPipsPerTrade = parseFloat(req.query.worstPipsPerTrade) || null
  const minTrades = req.query.minTrades || null

  const file = `cache/stats/wmaCrossedOver/${abbrev}.JSON`

  let stats 
  try {
    stats = JSON.parse(await fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return res.status(500).send('Failed to read cache')
  }


  stats.forEach((s) => {
    const c = s.tradesPerDay * 0.2 
    s.shortNetPipsPerDay = s.pipsPerDay + c
  })

  if (minTrades) stats = stats.filter((x) => x.trades >= minTrades)
  if (pipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade >= pipsPerTrade)
  if (worstPipsPerTrade) stats = stats.filter((x) => x.pipsPerTrade < worstPipsPerTrade * -1)

  if (sortBy) return res.send(sortStatsBy(stats, sortBy))

  return res.send(stats.splice(0, 1000))
}


exports.getCachedCalcPeriods = async (req, res) => {
  const fromDate = req.query.fromDate || null
  const toDate = req.query.toDate || null 
  const buffer = parseInt(req.query.buffer) || 0 
  
  let periods
  try {
    periods = JSON.parse( await fs.readFileSync('cache/calculatedPeriods.JSON', 'utf8'))
  } catch (e) {
    return res.status(500).send('Failed to read periods from cache')
  }

  if (fromDate) {
    const x = periods.findIndex((y) => new Date(y.date) > new Date(fromDate))
    periods.splice(0, x - buffer)
  }

  if (toDate) {
    const x = periods.findIndex((y) => new Date(y.date) > new Date(toDate))
    periods.splice(x + buffer, periods.length)
  }

  return res.send(periods.splice(0, 20))
}


exports.candlePatternSimulator = async (req, res) => {
  const abbrev = req.params.abbrev 
  const sinceDate = req.query.sinceDate ? new Date(req.query.sinceDate) : null

  let allCandles 
  try {
    allCandles = JSON.parse( 
      await fs.readFileSync(`cache/historicCandles/${abbrev}.JSON`, 'utf8')
    )
  } catch (e) {
    return res.status(500).send('Failed to read candles from cache')
  }

  const candles = allCandles
    .filter((x) => new Date(x.date) >= sinceDate)
    .map((x) => ({
      date: x.date,
      open: parseFloat(x.candle.o),
      high: parseFloat(x.candle.h),
      low: parseFloat(x.candle.l),
      close: parseFloat(x.candle.c)
    }))


  // candlePatterns(candles)
  

  return res.send(candles)
}