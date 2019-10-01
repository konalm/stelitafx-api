const config = require('../config');
const majorCurrencies = config.MAJOR_CURRENCIES
const quoteCurrency = config.QUOTE_CURRENCY;
const service = require('./service');
const tradeService = require('../trade/service');
const tradeRepo = require('../trade/repository');
const currencyRateRepo = require('../currencyRates/repository');


module.exports = (
  prototypeNo,
  conditionData,
  openConditionsMet,
  closeConditionsMet,
  timeInterval
) => {
  majorCurrencies.forEach((currency) => {
    try {
      prototypeFramework(
        prototypeNo,
        currency,
        conditionData,
        openConditionsMet,
        closeConditionsMet,
        timeInterval
      )
    } catch(err) {
      throw new Error(err);
    }
  });
}


/**
 *
 */
const prototypeFramework =
  async (
    protoNo,
    currency,
    conditionDataForTrades,
    openConditionsMet,
    closeConditionsMet,
    timeInterval
  ) =>
{
  const abbrev = `${currency}/${quoteCurrency}`;

  const tradeData = await conditionDataForTrades(abbrev, timeInterval);
  const currencyRate = await currencyRateRepo.getCurrencyRate(abbrev);
  if (!currencyRate) return;

  /* last trade */
  let openingTrade;
  try {
    openingTrade = await tradeRepo.getLastTrade(protoNo, timeInterval, abbrev);
  } catch (err) {
    throw new Error(`Failed to get last trade: ${err}`)
  }

  const notes = JSON.stringify(tradeData);

  /* open trade */
  if (!openingTrade || openingTrade.closed) {
    if (await openConditionsMet(tradeData, timeInterval)) {
      try {
        await tradeService.openTrade(
          protoNo,
          currency,
          currencyRate.rate,
          JSON.stringify(notes),
          '',
          timeInterval
        )
      } catch (err) {
        throw new Error(`Failed to open trade: ${err}`)
      }
    }

    return;
  }

  /* close trade */
  if (await closeConditionsMet(tradeData)) {
    try {
      await tradeService.closeTrade(
        protoNo,
        currency,
        currencyRate.rate,
        notes,
        timeInterval
      );
    } catch (err) {
      throw new Error(`Failed to close trade: ${err}`)
    }
  }
}
