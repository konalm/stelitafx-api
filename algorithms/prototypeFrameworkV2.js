const config = require('../config');
const majorCurrencies = config.MAJOR_CURRENCIES
const quoteCurrency = config.QUOTE_CURRENCY;
const tradeService = require('../trade/service');
// const tradeMongoRepo = require('../trade/mongoRepository')
const tradeRepo = require('../trade/repository')
const indicators = require('./indicators')


module.exports = async (
  protoNo, 
  currency, 
  openConditions, 
  closeConditions,
  timeInterval,
  dataRelevantToIntervalAndCurrency,
  conn,
  transactionType
) => new Promise(async (resolve, reject) =>   
{
  const abbrev = `${currency}/${quoteCurrency}`

  let s = new Date()

  /* opening trade */
  let gotCachedLastTrade = true

  let openingTrade;
  try {
    openingTrade = await tradeService.getCachedLastTrade(protoNo, abbrev, timeInterval)
  } catch (e) {
    gotCachedLastTrade = false 
    console.error(`Failed to get cached last trade for prototype ${protoNo}, 
      abbrev ${abbrev}, interval ${timeInterval}`)
  }

  if (!gotCachedLastTrade) {
    try {
      openingTrade = await tradeRepo.getLastTrade(protoNo, timeInterval, abbrev, null)
    } catch (e) {
      console.error(`Failed to get last trade for prototype ${protoNo}, 
        abbrev ${abbrev}, interval ${timeInterval}`)
    }
  }

  const data = indicators.dataForIndicators(
    abbrev, 
    dataRelevantToIntervalAndCurrency,
    openingTrade
  )
  const notes = JSON.stringify(data)

  if (!openingTrade || openingTrade.closed) {
    const openConditionsMet = indicators.indicatorsTriggered(data, openConditions)

    if (openConditionsMet) {
      s = new Date()
      let openStats = ''

      try {
        await tradeService.openTrade(
          protoNo, 
          currency, 
          data.currentRate, 
          notes, 
          JSON.stringify(openStats),
          timeInterval,
          null,
          transactionType
        );
      } catch (e) {
        return reject(`Failed to open trade`)
      }
    }

    return resolve()
  } 

  // console.log('looking at close conditions @ ' + new Date()) 


  /* close trade */
  const closeConditionsMet = indicators.anIndicatorTriggered(data, closeConditions)    
  if (closeConditionsMet) {
    const indicatorStateOnClose = indicators.indicators(data);
    const closeNotes = { data, indicatorState: indicatorStateOnClose }

    await tradeService.closeTrade(
      protoNo, 
      currency, 
      data.currentRate, 
      JSON.stringify(closeNotes),
      timeInterval,
      openingTrade,
    );
  }

  return resolve()
})
