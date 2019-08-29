const config = require('../config');
const majorCurrencies = config.MAJOR_CURRENCIES
const quoteCurrency = config.QUOTE_CURRENCY;
const tradeService = require('../trade/service');
const indicators = require('./indicators')
const service = require('./service')

module.exports = (prototypeNo, openConditions, closeConditions) => {
  majorCurrencies.forEach((currency) => {
    try {
      prototypeFramework(prototypeNo, currency, openConditions, closeConditions)
    } catch(err) {
      throw new Error(err);
    }
  });
}


/**
 *
 */
const prototypeFramework = async (protoNo, currency, openConditions, closeConditions) =>
{
  const abbrev = `${currency}/${quoteCurrency}`
  const data = await indicators.dataForIndicators(protoNo, abbrev)
  const notes = JSON.stringify(data)

  /* open trade */
  const openingTrade = data.openingTrade

  if (!openingTrade || openingTrade.closed) {
    const openConditionsMet = indicators.indicatorsTriggered(data, openConditions)
    if (openConditionsMet) {
      const openStats = await service.stats(data, abbrev)
      await tradeService.openTrade(
        protoNo, 
        abbrev, 
        data.currentRate, 
        notes, 
        JSON.stringify(openStats)
      );
    }
    return;
  }

  /* close trade */
  const closeConditionsMet = indicators.anIndicatorTriggered(data, closeConditions)    
  if (closeConditionsMet) {
    const indicatorStateOnClose = indicators.indicators(data);
    const closeNotes = { data, indicatorState: indicatorStateOnClose }
    await tradeService.closeTrade(protoNo, abbrev, data.currentRate, JSON.stringify(closeNotes));
  }
}
