const conn = require('../db');

/**
 *
 */
exports.GetCurrencyPairsAndLatestRate = new Promise(function(resolve, reject) {
  const query = `
    SELECT cp.abbrev, cp.base_currency, cr.date, cr.exchange_rate
    FROM currency_pair cp
    LEFT JOIN currency_rate cr
      ON cr.abbrev = cp.abbrev
    WHERE date = (
      SELECT MAX(date)
      FROM currency_rate cr2
      WHERE cr2.abbrev = cp.abbrev
    )`;

  conn.query(query, (err, results) => {
    if (err) return reject('Error Getting currency pair and latest rate');


    resolve(results);
  });
});


/**
 *
 */
exports.GetCurrencyLatestRates = (currencyAbbrev, ratesAmount) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT date, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
    ORDER BY date DESC
    LIMIT ?`;

  conn.query(query, [currencyAbbrev, ratesAmount], (err, results) => {
    if (err) return reject('Error Getting currency latest rates');

    resolve(results);
  });
});
