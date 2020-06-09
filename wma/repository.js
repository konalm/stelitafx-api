const conn = require('../db');
const db = require('../dbInstance')
const getIntervalMins = require('../services/intervalMins')
const formatMysqlDate = require('../services/formatMysqlDate')
const symbolToAbbrev = require('@/services/symbolToAbbrev');


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


exports.getWMAFromDate = (symbol, timeInterval, startDate, toDate) => 
  new Promise((resolve, reject) => 
{
  const abbrev = symbolToAbbrev(symbol)
  const useGran = typeof(timeInterval) === 'string' && timeInterval.includes('H') ? true : false 

  let query = `
    SELECT abbrev, date, rate, wma_data_json
    FROM currency_wma
    WHERE date >= ?
    AND date <= ?
  `
  if (!useGran) query += ` AND time_interval = ?`
  else query += ` AND gran = ?`

  if (abbrev) query += ` AND abbrev = ?`
  query += ` ORDER BY date DESC`

  const queryValues = [formatMysqlDate(startDate), formatMysqlDate(toDate), timeInterval]
  
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


exports.getWMAsBetweenDates = (abbrev, startDate, endDate, _timeInterval, _buffer) =>
  new Promise((resolve, reject) =>
{
  console.log('get wmas between dates')
  console.log(_timeInterval)

  const useGran = !_timeInterval.includes('H') 
    ? false 
    : true 
  const interval = useGran ? intervalFromGran(_timeInterval) : _timeInterval

  // const buffer = !useGran ? _buffer * interval : 0
  const buffer = _buffer * interval

  let query = `
    SELECT date, rate, wma_data_json
    FROM currency_wma
    WHERE abbrev = ?
    AND date >= (? - INTERVAL ? MINUTE)
    AND date <= (? + INTERVAL ? MINUTE)`
  
  if (!useGran) query += ` AND time_interval = ?`
  else query += ` AND gran = ?`

  query += ` ORDER BY date DESC`

  const queryValues = [abbrev, startDate, buffer, endDate, buffer, _timeInterval];


  console.log(query)
  console.log(queryValues)

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
