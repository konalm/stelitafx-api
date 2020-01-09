const conn = require('../db');
const db = require('../dbInstance');
const getIntervalMins = require('../services/intervalMins')
const secondsBetweenDates = require('../services/secondsBetweenDates')


exports.getMultiRates = () => new Promise((resolve, reject) => {
  const dbConn = db()

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
  dbConn.query(query, (err, results) => {
    
    if (err) return reject('Error getting multi rates')
    resolve(results)
  })
  dbConn.end()
})


/**
 * get currencies between (start date - buffer)  and (end date + buffer)
 * (Used for getting currencies between trades with addition rates before
 * and after that trade)
 */
exports.getCurrencyRatesBetweenDateRange = (abbrev, startDate, endDate, buffer) =>
  new Promise((resolve, reject) =>
{
  const dbConn = db()

  const query = `
    SELECT date, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
      AND date >= (? - INTERVAL ? MINUTE)
      AND date <= (? + INTERVAL ? MINUTE)
    ORDER BY date DESC`;
  const queryValues = [abbrev, startDate, buffer, endDate, buffer];

  dbConn.query(query, queryValues, (err, results) => {
    dbConn.end()

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
  conn
) =>
  new Promise((resolve, reject) =>
{
  const intervalMins = getIntervalMins(timeInterval)
  const query = `
    SELECT date, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
     AND MINUTE(date) IN (${intervalMins})
    ORDER BY date DESC
    LIMIT ?
  `
  const limit = ratesAmount + historicalCount

  const s = new Date()

  conn.query(query, [currencyAbbrev, limit], (e, results) => {
    if (e) return reject('Failed Getting currency latest rates');

    resolve(results);
  });
  if (!conn) dbConn.end()
});


/**
 *
 */
exports.getCurrencyRatesAtDate = (abbrev, date, historic) =>
  new Promise((resolve, reject) =>
{
  const dbConn = db()
  const query = `
    SELECT date, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
      AND date <= ?
      ORDER BY date DESC
    LIMIT ?
  `
  const queryValues = [abbrev, date, historic];

  dbConn.query(query, queryValues, (err, results) => {
    dbConn.end()

    if (err) return reject('Error getting currency rates by date');
    resolve(results);
  });
});


/**
 *
 */
exports.getCurrencyRate = (abbrev) => new Promise((resolve, reject) => {
  const dbConn = db()

  const query = `
    SELECT abbrev, exchange_rate
    FROM currency_rate
    WHERE abbrev = ?
    ORDER BY date DESC
    LIMIT 1
  `
  dbConn.query(query, [abbrev], (err, results) => {
    dbConn.end()

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
exports.getCurrenciesRates = (abbrev, count = 100) => new Promise((resolve, reject) => {
  const dbConn = db()

  const query = `
    SELECT abbrev, exchange_rate, date
    FROM currency_rate
    WHERE abbrev = ?
    ORDER BY date DESC
    LIMIT ?
  `
  dbConn.query(query, [abbrev, count], (err, results) => {
    dbConn.end()
    if (err) return reject(err);

    resolve(results);
  })
})


exports.getAbbrevLatestRates = () => new Promise((resolve, reject) => {
  console.log('get abbrev latest rates')

  const dbConn = db()

  const query = `
    SELECT 
      c.abbrev, 
      c.date, 
      c.exchange_rate AS exchangeRate
    FROM currency_rate c
    INNER JOIN (
      SELECT abbrev, MAX(date) date
      FROM stelita.currency_rate
      GROUP BY abbrev
    ) b ON b.abbrev = c.abbrev  AND b.date = c.date 
  `
  dbConn.query(query, (e, results) => {
    console.log('got abbrev latest rates :)')
    
    dbConn.end()

    if (e) {
      console.log('Failed to get abbrev lates rates')
      console.log(e)
      return reject(e)
    }

    resolve(results)
  })
})


exports.getAbbrevLatestRate = (abbrev) => new Promise((resolve, reject) => {
  const conn = db()

  const query = `
    SELECT exchange_rate AS rate
    FROM currency_rate
    WHERE abbrev = ?
    ORDER BY date DESC
    LIMIT 1
  `
  conn.query(query, [abbrev], (e, results) => {
    conn.end()
    if (e) return reject(e)

    resolve(results.rate)
  })
})