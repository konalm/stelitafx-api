const config = require('../config');
const majorCurrencies = config.MAJOR_CURRENCIES
const quoteCurrency = config.QUOTE_CURRENCY;
const tradeService = require('../trade/service');
const tradeMongoRepo = require('../trade/mongoRepository')
const tradeRepo = require('../trade/repository')
const indicators = require('./indicators')
const service = require('./service')
const secondsBetweenDates = require('../services/secondsBetweenDates')
const dbConnections = require('../dbConnections')


module.exports = async (
  protoNo, 
  currency, 
  openConditions, 
  closeConditions,
  timeInterval,
  currencyRateSource,
  dataRelevantToIntervalAndCurrency,
  conn
) => new Promise(async (resolve, reject) =>   
{
  const abbrev = `${currency}/${quoteCurrency}`

  // await dbConnections('getting opening trade')
  let s = new Date()

  /* opening trade */
  let gotCachedLastTrade = true

  let openingTrade;
  try {
    // openingTrade = await tradeMongoRepo.getLastTrade(protoNo, abbrev, timeInterval)
    // openingTrade = await tradeRepo.getLastTrade(protoNo, timeInterval, abbrev, conn)
    openingTrade = await tradeService.getCachedLastTrade(protoNo, abbrev, timeInterval)
  } catch (e) {
    // console.log(e)
    gotCachedLastTrade = false 
    console.error(`Failed to get last trade for prototype ${protoNo}, 
      abbrev ${abbrev}, interval ${timeInterval}`)
  }

  if (!gotCachedLastTrade) {
    console.log('No cached last trade :(')

    try {
      // openingTrade = await tradeMongoRepo.getLastTrade(protoNo, abbrev, timeInterval)
      openingTrade = await tradeRepo.getLastTrade(protoNo, timeInterval, abbrev, conn)
    } catch (e) {
      gotCachedLastTrade = false 
      console.error(`Failed to get last trade for prototype ${protoNo}, 
        abbrev ${abbrev}, interval ${timeInterval}`)
    }
  } else {
    console.log('Got cached last trade :)')
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

      let openStats
      try {
        openStats = await service.stats(data, abbrev)
      } catch (e) {
        console.log(`Failed to get open starts: ${e}`)
      }

      console.log(`getting open stats ... ${secondsBetweenDates(s)}`)

      s = new Date()

      // await dbConnections('opening trade')

      try {
        await tradeService.openTrade(
          protoNo, 
          currency, 
          data.currentRate, 
          notes, 
          JSON.stringify(openStats),
          timeInterval,
          currencyRateSource,
          conn
        );
      } catch (e) {
        console.error(e)
        return reject(`Failed to open trade`)
      }

      console.log(`opening trade took ... ${secondsBetweenDates(s)}`)
    }
    return resolve()
  } 

  /* close trade */
  const closeConditionsMet = indicators.anIndicatorTriggered(data, closeConditions)    
  if (closeConditionsMet) {
    const indicatorStateOnClose = indicators.indicators(data);
    const closeNotes = { data, indicatorState: indicatorStateOnClose }

    let s = new Date()

    // await dbConnections('closing trade')

    s = new Date()

    await tradeService.closeTrade(
      protoNo, 
      currency, 
      data.currentRate, 
      JSON.stringify(closeNotes),
      timeInterval,
      openingTrade,
      currencyRateSource
    );

    console.log(`closing trade took ... ${secondsBetweenDates(s) }`)
  }

  return resolve()
})
