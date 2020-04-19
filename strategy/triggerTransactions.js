const pipCalc = require('@/services/calculatePip')
const tradeService = require('@/trade/service');
const symbolToAbbrev = require('@/services/symbolToAbbrev')


module.exports = 
  periods => 
  conditions => 
  stopLoss => 
  stopGain => 
  symbol => 
  transactionType =>
  algoNo =>
  interval =>
  async () => 
{
  const rate = periods.current.rate

  /* Opening trade */ 
  let openingTrade;
  try {
    openingTrade = await tradeService.getCachedLastTrade(algoNo, symbol, interval)
  } catch (e) {
    console.error(`Failed to get cached last trade for algo ${algoNo}, symbol ${symbol}, interval ${interval}`)
  }

  /* only check if trade opening conditions met if last trade has been closed */ 
  if (!openingTrade || openingTrade.closed) {
    if (conditions.open(periods.prior, periods.current)) {
      try {
        await tradeService.openTrade(algoNo, symbol, rate, null, interval, transactionType);
      } catch (e) {
       throw new Error(`Failed to open trade`)
      }
    } 

    return
  }

  console.log(`looking at close conditions for .. ${symbol}`)

  const closeTrade = async () => {
    console.log('TRIGGER TRANSACTION .. CLOSE TRADE')
    await tradeService.closeTrade(algoNo, symbol, rate, null, interval, openingTrade)
  }
  const abbrev = symbolToAbbrev(symbol)

  /* if stop loss, check if triggered */ 
  if (stopLoss) {
    if (pipCalc(openingTrade.rate, rate, abbrev) <= stopLoss * -1) return await closeTrade()
  }
  
  /* if stop gain, check if triggered */
  if (stopGain) {
    if (pipCalc(openingTrade.rate, rate, abbrev) >= stopGain, abbrev) return await closeTrade()
  }

  if (conditions.close(periods.prior, periods.current)) await closeTrade()
}