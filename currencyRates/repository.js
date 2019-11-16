const conn = require('../db');
const db = require('../dbInstance');
const getIntervalMins = require('../services/intervalMins')

exports.getMultiRates = () => new Promise((resolve, reject) => {
  const query = `
    SELECT 
      abbrev, 
      date,
      oanda_demo_rate AS oandaDemoRate,
      oanda_fxaccount_rate AS oandaFXAccountRate,
      fixerio_rate AS fixerioRate
    FROM multi_rate
    ORDER BY date DESC
  `
  conn.query(query, (err, results) => {
    if (err) return reject('Error getting multi rates')

    resolve(results)
  })
})


/**
 * get currencies between (start date - buffer)  and (end date + buffer)
 * (Used for getting currencies between trades with addition rates before
 * and after that trade)
 */
exports.getCurrencyRatesBetweenDateRange = (abbrev, startDate, endDate, buffer) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT date, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
      AND date >= (? - INTERVAL ? MINUTE)
      AND date <= (? + INTERVAL ? MINUTE)
    ORDER BY date DESC`;
  const queryValues = [abbrev, startDate, buffer, endDate, buffer];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject('Error getting currency rates between dates');

    resolve(results);
  });
});


/**
 *
 */
exports.GetCurrencyLatestRates = (
  currencyAbbrev, 
  ratesAmount, 
  historicalCount, 
  timeInterval,
  currencyRateTable
) =>
  new Promise((resolve, reject) =>
{
  console.log('get currency latest rates !!!!!!')
  const dbConn = db()

  const intervalMins = getIntervalMins(timeInterval)
 
  const query = `
    SELECT date, exchange_rate
    FROM ${currencyRateTable}
    WHERE abbrev = ?
     AND MINUTE(date) IN (${intervalMins})
    ORDER BY date DESC
    LIMIT ?
  `
  const limit = ratesAmount + historicalCount

  dbConn.query(query, [currencyAbbrev, limit], (err, results) => {
    if (err) {
      reject('Failed Getting currency latest rates');
      dbConn.end()
      return
    }

    resolve(results);
    dbConn.end()
  });
});


/**
 *
 */
exports.getCurrencyRatesAtDate = (abbrev, date, historic) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT date, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
      AND date <= ?
      ORDER BY date DESC
    LIMIT ?`;
  const queryValues = [abbrev, date, historic];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject('Error getting currency rates by date');

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

    if (results.length === 0) return;

    const mappedResult = {
      abbrev: results[0].abbrev,
      rate: results[0].exchange_rate
    }
    resolve(mappedResult);
  });
});


/**
 * get rates for a currency (current and previous)
 */
exports.getCurrenciesRates = (abbrev, count = 100) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT abbrev, exchange_rate, date
    FROM currency_rate
    WHERE abbrev = ?
    ORDER BY date DESC
    LIMIT ?`;

  conn.query(query, [abbrev, count], (err, results) => {
    if (err) return reject(err);

    resolve(results);
  })
})
