const pipCalc = require('@/services/calculatePip')

module.exports = periods  => conditions => stopLoss => stopGain => abbrev => {
  const trades = []

  let triggeredSameCandle = 0
  let didNot = 0

  // console.log(`periods ... ${periods.length}`)
  // console.log(periods[0])

  periods.forEach((x, i) => {
    let takeProfitTriggered = false;
    let stopLossTriggered = false

    const prior = i > 0 ? periods[i - 1] : null
    const lastTrade = trades.length ? trades[trades.length - 1] : null

    /* only check if trade opened if last trade has been closed */ 
    if (!lastTrade || lastTrade.close) {
      if (!prior) return 

      const openTrade = conditions.open(prior, x)
      if (openTrade) trades.push({ open: x, close: null })
      return
    }

    if (stopLoss || stopGain) {
      for (let m1Period of x.m1Candles) {
        if (stopGain) {
          // if (pipCalc(lastTrade.open.exchange_rate, x.candle.h, abbrev) >= stopGain) {
          if (pipCalc(lastTrade.open.exchange_rate, m1Period.candle.h, abbrev) >= stopGain) {
            takeProfitTriggered = true 
          }
        }
        if (stopLoss) {
          if (pipCalc(lastTrade.open.exchange_rate, m1Period.candle.l, abbrev) <= stopLoss * -1) {
          // if (pipCalc(lastTrade.open.exchange_rate, x.candle.l, abbrev) <= stopLoss * -1) {
            stopLossTriggered = true
          }
        }

        if (takeProfitTriggered) {
          // if (stopLossTriggered) console.log('triggered STOP LOSS & TAKE PROFIT IN SAME CANDLE')
          const pipGain = stopGain * 0.0001
          const rate = lastTrade.open.rate + pipGain 
          // const y = { ...m1Period, rate, exchange_rate: rate }
          const y = { ...x, rate, exchange_rate: rate }
          lastTrade.close = { ...y, triggeredStopGain: true, triggeredStopLoss: false }
          // break;
          return;
        }
      
        if (stopLossTriggered) {
          const pipLoss = stopLoss * 0.0001
          const rate = lastTrade.open.rate - pipLoss
          // const y = { ...m1Period, rate, exchange_rate: rate }
          const y = { ...x, rate, exchange_rate: rate }
          lastTrade.close = { ...y, triggeredStopLoss: true, triggeredStopGain: false }
          // break;
          return;
        }
      } 
    }
  
    if (conditions.close(prior, x)) {
      lastTrade.close = { 
        ...x, 
        ...x, 
        triggeredStopLoss: false,
        triggeredStopGain: false
      }
    }
  })

  return trades.filter((x) => x.close)
}