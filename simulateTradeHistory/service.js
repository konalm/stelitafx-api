const moment = require('moment')
const fs = require('fs')
const { Worker } = require('worker_threads')
const calcWmaInBatch = require('@/indicators/wma/service/calcWmaInBatch')
// const { getCurrencyRatesSinceDate } = require('@/currencyRates/repository')
const pipCalc = require('@/services/calculatePip')


exports.getWmaPerformances = (fastWma, periods, max, stopSettings) => {
  console.log(`get wma performance for ... ${fastWma}`)
  // console.log(`going to loop ${max} times`)

  const wmaPerformances = []

  const getStopGain = false 
  const getStopLossStopGain = false

  /* loop over every slow wma */
  for (let slowWma = fastWma + 1; slowWma <= max; slowWma ++) {
    console.log(`slow wma ... ${slowWma}`)
    
    const trades = this.simulatedTrades(periods, fastWma, slowWma, null)
    const pips = this.tradesTotalPips(trades)

    const stopLossResults = []
    for (let stopLoss = stopSettings.loss.min; stopLoss <= stopSettings.loss.max; stopLoss++) {
      const trades = this.simulatedTrades(periods, fastWma, slowWma, stopLoss, null)
      const pips = this.tradesTotalPips(trades)
      stopLossResults.push({ stopLoss, pips})
    }
    const bestStopLoss = stopLossResults.reduce((a, b) => (a.pips > b.pips) ? a : b)
    const worstStopLoss = stopLossResults.reduce((a, b) => (a.pips < b.pips) ? a : b)
    
    // if (getStopGain) {
    //   const stopGainResults = []
    //   for (let stopGain = stopSettings.gain.min; stopGain <= stopSettings.gain.max; stopGain ++) {
    //     const trades = this.simulatedTrades(periods, fastWma, slowWma, null, stopGain)
    //     const pips = this.tradesTotalPips(trades)
    //     stopGainResults.push({ stopGain, pips })
    //   }
    //   const bestStopGain = stopGainResults.reduce((a, b) => (a.pips > b.pips) ? a : b)
    //   const worstStopGain = stopGainResults.reduce((a, b) => (a.pips < b.pips) ? a : b)
    // }

    // if (getStopLossStopGain) {
    //   const stopLossStopGainResults = []
    //   for (let stopLoss = stopSettings.loss.min; stopLoss <= stopSettings.loss.max; stopLoss ++) {
    //     for (let stopGain = stopSettings.gain.min; stopGain <= stopSettings.gain.max; stopGain ++) {
    //       const trades = this.simulatedTrades(periods, fastWma, slowWma, stopLoss, stopGain)
    //       const pips = this.tradesTotalPips(trades)
    //       stopLossStopGainResults.push({ stopLoss, stopGain, pips })
    //     }
    //   }
    //   const bestStopLossStopGain = stopLossStopGainResults.reduce((a, b) => 
    //     (a.pips > b.pips) ? a : b
    //   )
    //   const worstStopLossStopGain = stopLossStopGainResults.reduce((a, b) => 
    //     (a.pips < b.pips) ? a : b
    //   )
    // }

    wmaPerformances.push({ 
      slowWma, 
      trades: trades.length - 1, 
      pips,
      pipsPerTrade: pips / trades.length,

      stopLoss: {
        best: { 
          ...bestStopLoss, 
          pipsPerTrade: bestStopLoss.pips / trades.length
        },
        worst: { 
          ...worstStopLoss,
          pipsPerTrade: worstStopLoss.pips / trades.length
        }
      },

      // stopGain: {
      //   best: {
      //     ...bestStopGain,
      //     pipsPerTrade: bestStopGain.pips / trades.length
      //   },
      //   worst: {
      //     ...worstStopGain,
      //     pipsPerTrade: worstStopGain.pips / trades.length
      //   }
      // },
      // stopLossStopGain: {
      //   best: {
      //     ...bestStopLossStopGain,
      //     pipsPerTrade: bestStopLossStopGain.pips / trades.length
      //   },
      //   worst: {
      //     ...worstStopLossStopGain,
      //     pipsPerTrade: worstStopLossStopGain.pips / trades.length
      //   }
    })
  }

  return wmaPerformances
}


exports.getCachedCalcPeriods = async () => {
  const dir = 'cache/simulatedPeriods'

  let weeklyCachedRates
  try {
    weeklyCachedRates = await fs.readdirSync(dir)
  } catch (e) {
    throw new Error(e)
  }

  let periods = [] 
  for (let i = 0; i < weeklyCachedRates.length; i ++) {
    let weeklyPeriods 
    try {
      weeklyPeriods = JSON.parse(await fs.readFileSync(`${dir}/${weeklyCachedRates[i]}`))
    } catch (e) {
      throw new Error(e)
    }

    periods.push(...weeklyPeriods)
  }

  return periods.sort((a,b) => new Date(a.date) - new Date(b.date))
}


exports.calcPeriodsWMAs = async (currencyRates, min, max) => {
  console.log('calc periods wma !!')

  const s = new Date()
  const periods = [...currencyRates]

  periods.forEach((x, periodIndex) => {
    x.wma = {}
    for (let i = min; i <= max; i++) {
      x.wma[i] = calcWmaInBatch(currencyRates, periodIndex, i)
    }
  })

  return periods;
}


exports.updateSimulatedPeriodsCache = async (interval, abbrev, sinceDate, min, max) => {
  const weeks = this.getWeeksSinceDate(sinceDate)

  let currencyRates 
  // try {
  //   currencyRates = await getCurrencyRatesSinceDate(interval, abbrev, sinceDate)
  // } catch (e) {
  //   return res.status(500).send('Failed to get currency rates')
  // }
  console.log('currency rates .... ' + currencyRates.length);

  /* group rates into a week */
  const currencyRatesByWeek = []
  weeks.forEach((w, i) => {
    const week = `${moment(w.beginning).format('YYYY-MM-DD')}--${moment(w.end).format('YYYY-MM-DD')}`

    const rates = currencyRates.filter((x) => {
      const d = new Date(x.date)

      return d >= w.beginning && d <= w.end
    })

    if ( i > 0 ) {
      const priorRates = [...currencyRatesByWeek[currencyRatesByWeek.length - 1].rates]
      const priorRatesForWMa = priorRates.splice(priorRates.length - max, max)
      rates.unshift(...priorRatesForWMa)
    }

    currencyRatesByWeek.push({ week, rates })
  })

  console.log(`currency rates by week .. ${currencyRatesByWeek.length}`)

  const workerPromises = []
  currencyRatesByWeek.forEach((x) => {
    workerPromises.push(cahePreCalcRatesWorker(x.week, x.rates, min, max))
  })

  try {
    await Promise.all(workerPromises)
  } catch (e) {
    console.log('workers failed')
  }

  console.log('ALL WORKERS COMPLETE :))))')
}


const cahePreCalcRatesWorker = (week, rates, min, max) => new Promise((resolve, reject) => {
  console.log('cache pre calc rates worker !')

  const workerData = { week, rates, min, max }
  const worker = new Worker('./cachePreCalculatedRates.js', { workerData })
  worker.on('message', (mes) => {
    console.log('RECIEVED MESSAGE FROM WORKER')
    console.log(mes)
  })
  worker.on('error', (e) => console.log(e))
  worker.on('exit', (exit) => {
    console.log('EXIT !!!!!!!')
    resolve()
  })
})


exports.simulatedTrades = (periods, fastWMA, slowWMA, stopLoss, stopGain) => {
  const trades = []

  periods.forEach((x, i) => {
    const prior = i > 0 ? periods[i - 1] : null
    const lastTrade = trades.length ? trades[trades.length - 1] : null

    /* only check if trade opened if last trade has been closed */ 
    if (!lastTrade || lastTrade.close) {
      const openTrade = prior ? wmaCrossedOver(prior, x, fastWMA, slowWMA) : false
      if (openTrade) trades.push({ open: x, close: null })
      return
    }

    /* if stop loss, check if triggered */ 
    if (stopLoss) {
      if (pipCalc(lastTrade.open.exchange_rate, x.exchange_rate) <= stopLoss * -1) {
        lastTrade.close = { ...x, triggeredStopLoss: true, triggeredStopGain: false }
        return
      }
    }

    /* if stop gain, check if triggered */
    if (stopGain) {
      if (pipCalc(lastTrade.open.exchange_rate, x.exchange_rate) >= stopGain) {
        lastTrade.close = { ...x, triggeredStopGain: true, triggeredStopLoss: false }
        return
      }
    }

    if (wmaUnder(x, fastWMA, slowWMA)) {
      lastTrade.close = { 
        ...x, 
        triggeredStopLoss: false,
        triggeredStopGain: false
      }
    }
  })

  return trades.filter((x) => x.close)
}


exports.tradesTotalPips = (trades, abbrev) => {
  let totalPips = 0

  trades.forEach((x) => {
    if (!x.close) return   
    totalPips += pipCalc(x.open.rate, x.close.rate, abbrev)
  })

  return totalPips
}


exports.wmaPerformanceStats = (wmaPerformances) => {
  const stats = { 
    noStops: { best: {}, worst: {},  },
    withStopLoss: { best: {}, worst: {} },
    withStopGain: { best: {}, worst: {} },
    withStopLossStopGain: { best: {}, worst: {} }
  }

  /* no stops */ 
  const bestOverall = wmaPerformances.reduce((a, b) => 
    (a.stats.noStops.best.overall.pips > b.stats.noStops.best.overall.pips) ? a : b
  )
  const bestPerTrade = wmaPerformances.reduce((a, b) => 
    (a.stats.noStops.best.perTrade.pipsPerTrade > b.stats.noStops.best.perTrade.pipsPerTrade) ? a : b
  )
  const worstOverall = wmaPerformances.reduce((a, b) =>
    (a.stats.noStops.best.overall.pips < b.stats.noStops.best.overall.pips) ? a : b
  )
  const worstPerTrade = wmaPerformances.reduce((a, b) =>
    (a.stats.noStops.worst.perTrade.pipsPerTrade < b.stats.noStops.best.perTrade.pipsPerTrade) ? a : b
  )

  stats.noStops = {
    best: {
      overall: {
        fastWma: bestOverall.fastWma,
        ...bestOverall.stats.noStops.best.overall
      },
      perTrade: {
        fastWma: bestPerTrade.fastWma,
        ...bestPerTrade.stats.noStops.best.perTrade
      }
    },
    worst: {
      overall: {
        fastWma: worstOverall.fastWma,
        ...worstOverall.stats.noStops.worst.overall
      },
      perTrade: {
        fastWma: worstPerTrade.fastWma,
        ...worstPerTrade.stats.noStops.worst.overall
      }
    }
  }

  /* stop loss */
  const bestOverallStopLoss = wmaPerformances.reduce((a, b) => 
    (a.stats.withStopLoss.best.pips > b.stats.withStopLoss.best.pips) ? a : b
  )
  const worstOverallStopLoss = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopLoss.worst.pips < b.stats.withStopLoss.worst.pips) ? a : b
  )
  const bestPerTradeStopLoss = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopLoss.best.pipsPerTrade > b.stats.withStopLoss.best.pipsPerTrade) ? a : b
  )
  const worstPerTradeStopLoss = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopLoss.worst.pipsPerTrade < b.stats.withStopLoss.worst.pipsPerTrade) ? a : b
  )

  stats.withStopLoss = {
    best: {
      overall: {
        fastWma: bestOverallStopLoss.fastWma,
        ...bestOverallStopLoss.stats.withStopLoss.best
      },
      perTrade: {
        fastWma: bestPerTradeStopLoss.fastWma,
        ...bestPerTradeStopLoss.stats.withStopLoss.best
      }
    },
    worst: {
      overall: {
        fastWma: worstOverallStopLoss.fastWma,
        ...worstOverallStopLoss.stats.withStopLoss.worst
      },
      perTrade: {
        fastWma: worstPerTradeStopLoss.fastWma,
        ...worstPerTradeStopLoss.stats.withStopLoss.worst
      }
    }
  }

  return stats


  /* stop gain */ 
  const bestOverallStopGain = wmaPerformances.reduce((a, b) =>  
    (a.stats.withStopGain.best.pips > b.stats.withStopGain.best.pips) ? a : b
  )
  const worstOverallStopGain = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopGain.worst.pips < b.stats.withStopGain.worst.pips) ? a : b
  )
  const bestPerTradeStopGain = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopGain.best.pipsPerTrade > b.stats.withStopGain.best.pipsPerTrade) ? a : b
  )
  const worstPerTradeStopGain = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopGain.worst.pipsPerTrade < b.stats.withStopGain.worst.pipsPerTrade) ? a : b
  )

  stats.withStopGain = {
    best: {
      overall: {
        fastWma: bestOverallStopGain.fastWma,
        ...bestOverallStopGain.stats.withStopGain.best
      },
      perTrade: {
        fastWma: bestPerTradeStopGain.fastWma,
        ...bestPerTradeStopGain.stats.withStopGain.best
      }
    },
    worst: {
      overall: {
        fastWma: worstOverallStopGain.fastWma,
        ...worstOverallStopGain.stats.withStopGain.worst
      },
      perTrade: {
        fastWma: worstPerTradeStopGain.fastWma,
        ...worstPerTradeStopGain.stats.withStopGain.worst
      }
    }
  }

  /* stop loss & stop gain */
  const bestOverallStopLossStopGain = wmaPerformances.reduce((a, b) =>  
    (a.stats.withStopLossStopGain.best.pips > b.stats.withStopLossStopGain.best.pips) ? a : b
  )
  const worstOverallStopLossStopGain = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopLossStopGain.worst.pips < b.stats.withStopLossStopGain.worst.pips) ? a : b
  )
  const bestPerTradeStopLossStopGain = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopLossStopGain.best.pipsPerTrade > b.stats.withStopLossStopGain.best.pipsPerTrade) ? a : b
  )
  const worstPerTradeStopLossStopGain = wmaPerformances.reduce((a, b) =>
    (a.stats.withStopLossStopGain.worst.pipsPerTrade < b.stats.withStopLossStopGain.worst.pipsPerTrade) ? a : b
  )

  stats.withStopLossStopGain = {
    best: {
      overall: {
        fastWma: bestOverallStopLossStopGain.fastWma,
        ...bestOverallStopLossStopGain.stats.withStopGain.best
      },
      perTrade: {
        fastWma: bestPerTradeStopLossStopGain.fastWma,
        ...bestPerTradeStopLossStopGain.stats.withStopGain.best
      }
    },
    worst: {
      overall: {
        fastWma: worstOverallStopLossStopGain.fastWma,
        ...worstOverallStopLossStopGain.stats.withStopGain.worst
      },
      perTrade: {
        fastWma: worstPerTradeStopLossStopGain.fastWma,
        ...worstPerTradeStopLossStopGain.stats.withStopGain.worst
      }
    }
  }



  return stats
}


exports.wmaPerformanceItemStats = (wmaItems) => {
  if (!wmaItems || !wmaItems.length) return 

  /* no stop loss or stop gain */
  const noStops = {
    best: {
      overall: wmaItems.reduce((a, b) => (a.pips > b.pips) ? a : b),
      perTrade: wmaItems.reduce((a, b) => (a.pipsPerTrade > b.pipsPerTrade) ? a : b)
    },
    worst: {
      overall: wmaItems.reduce((a, b) => (a.pips < b.pips) ? a : b),
      perTrade: wmaItems.reduce((a, b) => (a.pipsPerTrade < b.pipsPerTrade) ? a : b)
    }
  }

  /* with stop loss */
  const wmaItemBestStopLoss = wmaItems.reduce((a, b) => 
    (a.stopLoss.best.pips > b.stopLoss.best.pips) ? a : b
  )
  const wmaItemWorstStopLoss = wmaItems.reduce((a, b) =>
    (a.stopLoss.best.pips < b.stopLoss.best.pips) ? a : b
  )

  const withStopLoss = {
    best: {
      slowWma: wmaItemBestStopLoss.slowWma,
      trades: wmaItemBestStopLoss.trades,
      stopLoss: wmaItemBestStopLoss.stopLoss.best.stopLoss,
      pips: wmaItemBestStopLoss.stopLoss.best.pips,
      pipsPerTrade: wmaItemBestStopLoss.stopLoss.best.pipsPerTrade
    },
    worst: {
      slowWma: wmaItemWorstStopLoss.slowWma,
      trades: wmaItemWorstStopLoss.trades,
      stopLoss: wmaItemWorstStopLoss.stopLoss.worst.stopLoss,
      pips: wmaItemWorstStopLoss.stopLoss.worst.pips,
      pipsPerTrade: wmaItemWorstStopLoss.stopLoss.worst.pipsPerTrade
    }
  }

  /* with stop gain */
  // const wmaItemBestStopGain = wmaItems.reduce((a, b) => 
  //   (a.stopGain.best.pips > b.stopGain.best.pips) ? a : b
  // )
  // const wmaItemWorstStopGain = wmaItems.reduce((a, b) =>
  //   (a.stopGain.best.pips < b.stopGain.best.pips) ? a : b
  // )

  // const withStopGain = {
  //   best: {
  //     slowWma: wmaItemBestStopGain.slowWma,
  //     trades: wmaItemBestStopGain.trades,
  //     stopGain: wmaItemBestStopGain.stopGain.best.stopGain,
  //     pips: wmaItemBestStopGain.stopGain.best.pips,
  //     pipsPerTrade: wmaItemBestStopGain.stopGain.best.pipsPerTrade
  //   },
  //   worst: {
  //     slowWma: wmaItemWorstStopGain.slowWma,
  //     trades: wmaItemWorstStopGain.trades,
  //     stopGain: wmaItemWorstStopGain.stopGain.worst.stopLoss,
  //     pips: wmaItemWorstStopGain.stopGain.worst.pips,
  //     pipsPerTrade: wmaItemWorstStopGain.stopGain.worst.pipsPerTrade
  //   }
  // }

  /* with stop loss & stop gain */ 
  // const wmaItemBestStopLossStopGain = wmaItems.reduce((a, b) =>
  //   (a.stopLossStopGain.best.pips > b.stopLossStopGain.best.pips) ? a : b
  // )
  // const wmaItemWorstStopLossStopGain = wmaItems.reduce((a, b) =>
  //   (a.stopLossStopGain.worst.pips < b.stopLossStopGain.worst.pips) ? a : b
  // )

  // const withStopLossStopGain = {
  //   best: {
  //     slowWma: wmaItemBestStopLossStopGain.slowWma,
  //     trades: wmaItemBestStopLossStopGain.trades,
  //     stopLoss: wmaItemBestStopLossStopGain.stopLossStopGain.best.stopLoss,
  //     stopGain: wmaItemBestStopLossStopGain.stopLossStopGain.best.stopGain,
  //     pips: wmaItemBestStopLossStopGain.stopLossStopGain.best.pips,
  //     pipsPerTrade: wmaItemBestStopLossStopGain.stopLossStopGain.best.pipsPerTrade
  //   },
  //   worst: {
  //     slowWma: wmaItemWorstStopLossStopGain.slowWma,
  //     trades: wmaItemWorstStopLossStopGain.trades,
  //     stopLoss: wmaItemWorstStopLossStopGain.stopLossStopGain.best.stopLoss,
  //     stopGain: wmaItemWorstStopLossStopGain.stopLossStopGain.best.stopGain,
  //     pips: wmaItemWorstStopLossStopGain.stopLossStopGain.best.pips,
  //     pipsPerTrade: wmaItemWorstStopLossStopGain.stopLossStopGain.best.pipsPerTrade
  //   }
  // }

  return { 
    noStops, 
    withStopLoss, 
    // withStopGain, 
    // withStopLossStopGain 
  }
}


const wmaCrossedOver = (prior, current, shortWma, longWma) => {
  if (!prior.wma[shortWma] || !prior.wma[longWma]) return false

  return (
    prior.wma[shortWma] <= prior.wma[longWma] && 
    current.wma[shortWma] > current.wma[longWma]
  ) 
}


const wmaUnder = (current, shortWma, longWma) => {
  if (!current.wma[shortWma] || !current.wma[longWma]) return false

  return current.wma[shortWma] < current.wma[longWma]
}

exports.getWeeksSinceDate = (sinceDate) => {
  const today = new Date()
  const firstWeek = getWeekRange(sinceDate)

  const weeks = [firstWeek]

  let week = firstWeek
  while (week.end < today) {
    const nextWeekDate = new Date(week.end)
    nextWeekDate.setDate(nextWeekDate.getDate() + 1)
    week = getWeekRange(nextWeekDate)

    weeks.push(week)
  }

  return weeks
}


exports.getMonthsSinceDate = (sinceDate) => {
  const monthDates = []

  /* loop every year */ 
  for (let y = s.getFullYear(); y <= now.getFullYear(); y++) {
    /* loop every month */ 
    for (let m = 0; m < 12; m++) {
      const d = new Date()
      d.setFullYear(y)
      d.setMonth(m)
      d.setDate(1)
      d.setHours(0)
      d.setMinutes(0)
      d.setMilliseconds(0)
      monthDates.push(d)
    }
  }

  console.log(monthDates)
}


const getWeekRange = (date) => {
  const d = new Date(date)
  const day = d.getDay()

  const bWeek = new Date(d)
  bWeek.setDate(bWeek.getDate() - day + 1)

  const endOfWeek = new Date(bWeek)
  endOfWeek.setDate(bWeek.getDate() + 6)

  return { beginning: bWeek, end: endOfWeek }
}