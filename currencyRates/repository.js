const conn = require('../db');
const db = require('../dbInstance');
const getIntervalMins = require('../services/intervalMins')
const secondsBetweenDates = require('../services/secondsBetweenDates')
const formatMysqlDate = require('../services/formatMysqlDate')


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
  // console.log(`MYSQL .. get currency latest rates`)
  // console.log(`currencyAbbrev .. ${currencyAbbrev}`)
  // console.log(`rates amount .. ${ratesAmount}`)
  // console.log(`hist count ... ${historicalCount}`)
  // console.log(`interval ... ${timeInterval}`)

  const dbConn = conn ? conn : db()

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

  dbConn.query(query, [currencyAbbrev, limit], (e, results) => {
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
    SELECT abbrev, exchange_rate, bid, ask
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
      rate: results[0].exchange_rate,
      bid: results[0].bid,
      ask: results[0].ask
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


exports.getXTBRatesFromDate = (abbrev, startDate, toDate) =>
  new Promise((resolve, reject) => 
{
    const query = `
      SELECT abbrev, date, bid AS rate
      FROM xtb_prices
      WHERE abbrev = ?
        AND date >= ?
        AND date <= ?
      ORDER BY date DESC
    `
    const queryValues = [abbrev, formatMysqlDate(startDate), formatMysqlDate(toDate)]

    const conn = db()
    conn.query(query, queryValues, (e, results) => {
      conn.end()
      if (e) return reject(e)

      resolve(results)
    })
})


exports.getXTBRates = (abbrev, interval, amount, offset = 0) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT date, bid, ask
    FROM xtb_prices
    WHERE abbrev = ?
    ORDER BY DATE DESC
    LIMIT ?
    OFFSET ?
  `
  const queryValues = [abbrev, interval, amount, offset]

  const conn = db()
  conn.query(query, queryValues, (e, results) => {
    conn.end()
    if (e) return reject(e)
    if (!results || results.length === 0) return resolve([])

    resolve(results)
  })
})


exports.insertCurrencyRateData = (currencyRates) =>
  new Promise(async (resolve, reject) =>  
{
  console.log('insert currency rate data')

  const query = `INSERT INTO currency_rate_data (abbrev, bid, ask, high, low) VALUES ?`
  const queryValues = []

  /* build row of data in sql query */
  currencyRates.forEach((x) => {
    const currency = x.symbol.substring(0, 3)
    const abbrev = `${currency}/USD`;
    const row = [abbrev, x.bid, x.ask, x.high, x.low]
    queryValues.push(row);
  })

  const dbConn = db()
  dbConn.query(query, [queryValues], (err, result) => {
    dbConn.end()
    if (err) {
      console.log('Failed to insert currency rate')
      return reject(err);
    }

    resolve()
  })
  
})