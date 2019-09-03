const conn = require('../db');
const getIntervalMins = require('../services/intervalMins')

exports.storeWMAData = (currencyAbbrev, rate, wmaData, timeInterval) =>
  new Promise((resolve, reject) =>
{
  const wmaDataJSON = JSON.stringify(wmaData);

  const query = `
    INSERT INTO currency_wma 
    (abbrev, rate, wma_data_json, time_interval) 
    VALUES ?`;
  const queryValues = [
    [currencyAbbrev, rate, wmaDataJSON, timeInterval]
  ];

  conn.query(query, [queryValues], (err) => {
    if (err) reject('Error storing currency WMA data');

    resolve('Stored WMA data')
  });
});


exports.getWMAs = (currencyAbbrev, interval, amount) => 
  new Promise((resolve, reject) => 
{
  const intervalMins = getIntervalMins(interval)

  const query = `
    SELECT date, rate, wma_data_json, time_interval
    FROM currency_wma
    WHERE abbrev = ?
      AND MINUTE(date) IN (${intervalMins})
    ORDER BY DATE DESC
    LIMIT ?`;
  const queryValues = [currencyAbbrev, amount];

  conn.query(query, queryValues, (err, results) => {
    if (err) reject(err);

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


/**
 *
 */
exports.getWMAsBetweenDates = (abbrev, startDate, endDate, buffer) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT date, rate, wma_data_json
    FROM currency_wma
    WHERE abbrev = ?
     AND date >= (? - INTERVAL ? MINUTE)
     AND date <= (? + INTERVAL ? MINUTE)
    ORDER BY date DESC`;
  const queryValues = [abbrev, startDate, buffer, endDate, buffer];

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
