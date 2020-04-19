const conn = require('../db');
const db = require('../dbInstance')
const getIntervalMins = require('../services/intervalMins')
const formatMysqlDate = require('../services/formatMysqlDate')


exports.storeWMAData = (currencyAbbrev, rate, wmaData, timeInterval, conn) =>
  new Promise((resolve, reject) =>
{
  const wmaDataJSON = JSON.stringify(wmaData);
  
  const query = `
    INSERT INTO currency_wma
    (abbrev, rate, wma_data_json, time_interval)
    VALUES ?
  `
  const queryValues = [
    [currencyAbbrev, rate, wmaDataJSON, timeInterval]
  ]
  
  conn.query(query, [queryValues], (e) => {
    if (e) {
      console.log('Failed to store wma data')
      console.log(e)
      return reject('Error storing currency WMA data');
    }

    resolve('Stored WMA data')
  })
});


let x = 0;
exports.getWMAs = (currencyAbbrev, interval, amount, offset = 0, currencyRateSource) =>
  new Promise((resolve, reject) =>
{
  x ++
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

  const dbConn = db()
  // console.log(`getting WMAs .... abbrev: ${currencyAbbrev}, interval: ${interval}`)

  dbConn.query(query, queryValues, (e, results) => {
    dbConn.end()
    x --;
    
    if (e) return reject(e);

    if (!results || results.length === 0) return resolve([]);

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
  })
})


exports.getWMAFromDate = (abbrev, timeInterval, startDate, toDate) => 
  new Promise((resolve, reject) => 
{
  let query = `
    SELECT abbrev, date, rate, wma_data_json
    FROM currency_wma
    WHERE time_interval = ?
      AND date >= ?
      AND date <= ?
  `
  if (abbrev) query += `AND abbrev = ?`
  query += `ORDER BY date DESC`

  const queryValues = [timeInterval, formatMysqlDate(startDate), formatMysqlDate(toDate)]
  
  if (abbrev) queryValues.push(abbrev)

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    dbConn.end()
    if (err) reject(err)

    if (!results) return []

    const dataPoints = [];
    results.forEach((result) => {
      const wmaData = JSON.parse(result.wma_data_json);
      const dataPoint = {
        abbrev: result.abbrev,
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
    ORDER BY date DESC
  `
  const queryValues = [abbrev, timeInterval, startDate, buffer, endDate, buffer];

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    dbConn.end()
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
    })

    resolve(dataPoints);
  })
})
