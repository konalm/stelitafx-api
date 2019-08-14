const config = require('../config');
const majorCurrencies = config.MAJOR_CURRENCIES
const quoteCurrency = config.QUOTE_CURRENCY;
const service = require('./service');
const tradeService = require('../trade/service');
const tradeRepo = require('../trade/repository');
const currencyRateRepo = require('../currencyRates/repository');

/**
 *
 */
module.exports = (prototypeNo, conditionData, openConditionsMet, closeConditionsMet) => {
  majorCurrencies.forEach((currency) => {
    try {
      prototypeFramework(
        prototypeNo,
        currency,
        conditionData,
        openConditionsMet,
        closeConditionsMet
      );
    } catch(err) {
      throw new Error(err);
    }
  });
}


/**
 *
 */
const prototypeFramework =
  async (protoNo, currency, conditionDataForTrades, openConditionsMet, closeConditionsMet) =>
{
  const abbrev = `${currency}/${quoteCurrency}`;

  const tradeData = await conditionDataForTrades(abbrev);
  const currencyRate = await currencyRateRepo.getCurrencyRate(abbrev);
  if (!currencyRate) return;

  /* last trade */
  let openingTrade;
  try {
    openingTrade = await tradeRepo.getLastTrade(protoNo, abbrev);
  } catch (err) {
    throw new Error(`Failed to get last trade: ${err}`)
  }

  /* open trade */
  if (!openingTrade || openingTrade.closed) {
    if (await openConditionsMet(tradeData)) {
      // console.log(`OPEN TRADE >> ${protoNo} >> ${abbrev}`);
      try {
        await tradeService.openTrade(protoNo, abbrev, currencyRate.rate, null);
      } catch (err) {
        throw new Error(`Failed to open trade: ${err}`)
      }
    }
    return;
  }

  /* close trade */
  if (await closeConditionsMet(tradeData)) {
    // console.log(`CLOSE TRADE >> ${protoNo} >> ${abbrev}`)

    try {
      await tradeService.closeTrade(protoNo, abbrev, currencyRate.rate);
    } catch (err) {
      throw new Error(`Failed to close trade: ${err}`)
    }
  }
}
