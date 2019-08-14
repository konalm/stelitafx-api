const currencyRatesRepo = require('../currencyRates/repository');
const calculateWMAs = require('./calculateWMAs');


/**
 *
 */
exports.getLatestWMAs = async (currencyPairAbbrev, wmaLength, historical) => {
  /* get rates */
  let currencyRates;
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                           currencyPairAbbrev,
                           wmaLength,
                           historical
                         );
  } catch (err) {
    throw new Error('Getting currency rates');
  }

  return calculateWMAs(currencyRates, wmaLength, historical);
}


/**
 *
 */
exports.getWMAsAtDate = async (abbrev, wmaLength, historical, date) => {
  const amount = wmaLength + historical;

  let currencyRates;
  try {
    currencyRates = await currencyRatesRepo.getCurrencyRatesAtDate(
                            abbrev,
                            date,
                            amount
                          );
  } catch (err) {
    throw new Error('Getting currency rates at date');
  }

  return calculateWMAs(currencyRates, wmaLength, historical);
};
