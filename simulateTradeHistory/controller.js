const fs = require('fs')
const { getCurrencyRatesSinceDate } = require('@/currencyRates/repository')
const calcWmaInBatch = require('@/indicators/wma/service/calcWmaInBatch')
const calcStochasticInBatch = require('@/indicators/stochastic/service/calcStochasticInBatch')
const calculatePip = require('@/services/calculatePip');
const minsBetweenDates = require('@/services/minsBetweenDates')
const service = require('./service')
const triggerConditions = require('./service/conditions')


exports.simulateTradeHistory = async (req, res) => {
  const stopLoss = null
  const stopGain = null
  
  let currencyRates 
  try {
    currencyRates = JSON.parse(await fs.readFileSync('cache/calculatedPeriods.JSON'))
  } catch (e) {
    return res.status(500).send('Failed to get currency rates')
  }
  
  const trades = []
  
  const periods = [...currencyRates]
  periods.forEach((x, i) => {
    const prior = i > 0 ? periods[i - 1] : null
    const lastTrade = trades.length ? trades[trades.length - 1] : null
    // const trigger = triggerConditions.twentyCrossoverTwoHundedWMA(prior, x)
    // const trigger = triggerConditions.twentyCrossunderTwoHundredWMA(prior, x)
    // const trigger = triggerConditions.tenCrossoverOneHundreddWMA(prior, x)
    // const trigger = triggerConditions.stochasticTwentyEighty(prior, x)
    const trigger = triggerConditions.wmaConjoinedStochastic(prior, x)

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

  console.log(`trades .. ${trades.length}`)
  
  return res.send({
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

    const stats = service.wmaPerformanceItemStats(slowWmaPerformances)
    
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


const triggeredStopLoss = (period, relevantRates, stopLoss) => {
  const lowestRate = relevantRates.reduce((a, b) => 
    (a.exchange_rate < b.exchange_rate) ? a : b
  )
  const lowestPip = calculatePip(period.open.exchange_rate, lowestRate.exchange_rate)

  if (lowestPip <= stopLoss * -1) {
    return {
      pips: stopLoss * -1,
      duration: minsBetweenDates(period.open.date, lowestRate.date),
      date: lowestRate.date,
      triggeredStopLoss: true,
      triggeredStopGain: false
    }
  }

  return false
}


const triggeredStopGain = (period, relevantRates, stopGain) => {
  const highestRate = relevantRates.reduce((a, b) => 
    (a.exchange_rate > b.exchange_rate) ? a : b
  )

  const highestPip = calculatePip(period.open.exchange_rate, highestRate.exchange_rate)

  if (highestPip >= stopGain) {
    return {
      pips: stopGain,
      duration: minsBetweenDates(period.close.date, highestRate.date),
      date: highestRate.date,
      triggeredStopGain: true,
      truggeredStopLoss: false
    }
  }

  return false
}
