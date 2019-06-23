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
exports.GetCurrencyLatestRates = (currencyAbbrev, ratesAmount, historicalCount) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT date, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
    ORDER BY date DESC
    LIMIT ?`;
  const limit = ratesAmount + historicalCount

  conn.query(query, [currencyAbbrev, limit], (err, results) => {
    if (err) return reject('Error Getting currency latest rates');

    resolve(results);
  });
});


/**
 *
 */
exports.getCurrencyRate = (abbrev) => new Promise((resolve, reject) => {
  const query = `
    SELECT abbrev, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
    ORDER BY date DESC
    LIMIT 1`;

  conn.query(query, [abbrev], (err, results) => {
    if (err) return reject(err);

    const mappedResult = {
      abbrev: results[0].abbrev,
      rate: results[0].exchange_rate
    }
    resolve(mappedResult);
  });
});
