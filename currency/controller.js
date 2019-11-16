const config = require('../config.js');


/**
 *
 */
exports.getMajorCurrencies = (req, res) => {
  const currencies = config.MAJOR_CURRENCIES;
  const quoteCurrency = config.QUOTE_CURRENCY;

  const currencyPairAbbrevs = [];
  currencies.forEach((currency) => {
    const currencyAbbrev = {
      baseAbbrev: currency,
      pairAbbrev: `${currency}/${quoteCurrency}`
    };
    currencyPairAbbrevs.push(currencyAbbrev);
  })

  return res.send(currencyPairAbbrevs);
}
