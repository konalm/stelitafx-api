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
  new Promise(async (resolve, reject) => 
{
  const rate = periods.current.rate

  if (algoNo === 10000) {
    console.log(`trigger transaction ... ${algoNo} TEST`)
  }

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
      console.log(`OPEN TRADE .. ${algoNo}`)
      try {
        await tradeService.openTrade(algoNo, symbol, rate, null, interval, transactionType);
      } catch (e) {
       return reject(`Failed to open trade`)
      }
    } 

    return resolve()
  }

  const closeTrade = async () => {
    console.log(`CLOSE TRADE .. ${algoNo}`)
    await tradeService.closeTrade(algoNo, symbol, rate, null, interval, openingTrade)
  }
  const abbrev = symbolToAbbrev(symbol)

  /* if stop loss, check if triggered */ 
  if (stopLoss) {
    if (pipCalc(openingTrade.rate, rate, abbrev) <= stopLoss * -1)  {
      await closeTrade()
      return resolve()
    }
  }
  
  /* if stop gain, check if triggered */
  if (stopGain) {
    if (pipCalc(openingTrade.rate, rate, abbrev) >= stopGain, abbrev) {
      await closeTrade()
      return resolve()
    }
  }

  if (conditions.close(periods.prior, periods.current)) await closeTrade()
  resolve()
})