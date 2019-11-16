const conn = require('../db');
const db = require('../dbInstance')
const getIntervalMins = require('../services/intervalMins')
const formatMysqlDate = require('../services/formatMysqlDate')



exports.storeWMAData = (currencyAbbrev, rate, wmaData, timeInterval, currencyRateSrc) =>
  new Promise((resolve, reject) =>
{
  const dbConn = db()

  const wmaDataJSON = JSON.stringify(wmaData);

  let table = 'currency_wma'
  if (currencyRateSrc === 'fixerio_currency_rate') table = 'fixerio_currency_wma'

  const query = `
    INSERT INTO ${table}
    (abbrev, rate, wma_data_json, time_interval)
    VALUES ?
  `
  const queryValues = [
    [currencyAbbrev, rate, wmaDataJSON, timeInterval]
  ]

  dbConn.query(query, [queryValues], (err) => {
    console.log('close connection !!')
    dbConn.end();

    if (err) {
      reject('Error storing currency WMA data');
      return 
    }

    resolve('Stored WMA data')
  });
});


exports.getWMAs = (currencyAbbrev, interval, amount, offset = 0, currencyRateSource) =>
  new Promise((resolve, reject) =>
{
  let table = 'currency_wma'
  if (currencyRateSource === 'fixerio_currency_rate') table = 'fixerio_currency_wma'

  let query = `
    SELECT date, rate, wma_data_json, time_interval
    FROM ${table}
    WHERE abbrev = ?
      AND time_interval = ?
    ORDER BY DATE DESC
    LIMIT ?
    OFFSET ?
  `
  const queryValues = [currencyAbbrev, interval, amount, offset];

  conn.query(query, queryValues, (e, results) => {
    if (e) return reject(e);

    if (!results || results.length === 0) return [];

    const dataPoints = [];
    results.forEach((result) => {
      const wmaData = JSON.parse(result.wma_data_json);
      let dataPoint = {
        date: result.date,
        rate: result.rate,
        WMAs: {}
      };
      wmaData.forEach((wmaRow) => {
        dataPoint.WMAs[wmaRow.length] = wmaRow.wma
      });

      dataPoints.push(dataPoint);
    });

    resolve(dataPoints);
  });
});


exports.getWMAFromDate = (abbrev, timeInterval, startDate) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT date, rate, wma_data_json
    FROM currency_wma
    WHERE abbrev = ?
      AND time_interval = ?
      AND date >= ?
    ORDER BY date DESC
  `
  const queryValues = [abbrev, timeInterval, formatMysqlDate(startDate)]

  conn.query(query, queryValues, (err, results) => {
    if (err) reject(err)

    if (!results) return []

    const dataPoints = [];
    results.forEach((result) => {
      const wmaData = JSON.parse(result.wma_data_json);
      const dataPoint = {
        date: result.date,
        rate: result.rate,
        WMAs: {}
      };
      wmaData.forEach((wmaRow) => {
        dataPoint.WMAs[wmaRow.length] = wmaRow.wma
      });

      dataPoints.push(dataPoint);
    });

    resolve(dataPoints)
  })
})

exports.getWMAsBetweenDates = (abbrev, startDate, endDate, timeInterval, _buffer) =>
  new Promise((resolve, reject) =>
{
  const buffer = _buffer * timeInterval
  const query = `
    SELECT date, rate, wma_data_json
    FROM currency_wma
    WHERE abbrev = ?
     AND time_interval = ?
     AND date >= (? - INTERVAL ? MINUTE)
     AND date <= (? + INTERVAL ? MINUTE)
    ORDER BY date DESC`;
  const queryValues = [abbrev, timeInterval, startDate, buffer, endDate, buffer];

  conn.query(query, queryValues, (err, results) => {
    if (err) reject(err);

    if (!results) return [];

    const dataPoints = [];
    results.forEach((result) => {
      const wmaData = JSON.parse(result.wma_data_json);
      const dataPoint = {
        date: result.date,
        rate: result.rate,
        WMAs: {}
      };
      wmaData.forEach((wmaRow) => {
        dataPoint.WMAs[wmaRow.length] = wmaRow.wma
      });

      dataPoints.push(dataPoint);
    });

    resolve(dataPoints);
  });
});
