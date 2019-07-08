const currencyRatesRepo = require('../currencyRates/repository');
const calculateWMAs = require('./calculateWMAs');


/**
 *
 */
module.exports = async (currencyPairAbbrev, wmaLength, historical) => {
  console.log('get WMA >>>>>>>>>>>>>>>>>>>');
  console.log('wma length >>> ' + wmaLength);
  console.log('historical >>> ' + historical);

  /* get rates */
  let currencyRates;
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                           currencyPairAbbrev,
                           wmaLength,
                           historical
                         );
  } catch (err) {
    console.log(err)
    throw new Error('Getting currency rates');
  }

  return calculateWMAs(currencyRates, wmaLength, historical);

}
