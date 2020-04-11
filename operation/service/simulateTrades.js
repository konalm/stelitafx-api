const pipCalc = require('@/services/calculatePip')

module.exports = periods => conditions => stopLoss => stopGain => abbrev => {
  const trades = []
  const oneMinStopLoss = false

  periods.forEach((x, i) => {
    const prior = i > 0 ? periods[i - 1] : null
    const lastTrade = trades.length ? trades[trades.length - 1] : null

    /* only check if trade opened if last trade has been closed */ 
    if (!lastTrade || lastTrade.close) {
      if (!prior) return 

      const openTrade = conditions.open(prior, x)
      if (openTrade) trades.push({ open: x, close: null })
      return
    }

    /* if stop loss, check if triggered */ 
    if (stopLoss) {
      if (oneMinStopLoss) {
        /* loop 1M candles */
        x.oneMinCandles.forEach((oneMinCandle) => {
          if (
            pipCalc(lastTrade.open.exchange_rate, oneMinCandle.exchange_rate, abbrev) <= stopLoss * -1
          ) {
            lastTrade.close = { ...oneMinCandle, triggeredStopLoss: true, triggeredStopGain: false }
            return
          }
        })
      } else {
        /* just check the 5M candles */
        if (pipCalc(lastTrade.open.exchange_rate, x.exchange_rate, abbrev) <= stopLoss * -1) {
          lastTrade.close = { ...x, triggeredStopLoss: true, triggeredStopGain: false }
          return
        }
      }
    } 

    /* if stop gain, check if triggered */
    if (stopGain) {
      if (pipCalc(lastTrade.open.exchange_rate, x.exchange_rate) >= stopGain, abbrev) {
        lastTrade.close = { ...x, triggeredStopGain: true, triggeredStopLoss: false }
        return
      }
    }


    if (conditions.close(prior, x)) {
      lastTrade.close = { 
        ...x, 
        triggeredStopLoss: false,
        triggeredStopGain: false
      }
    }
  })

  return trades.filter((x) => x.close)
}