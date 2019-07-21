const conn = require('../db');


exports.storeWMAData = (currencyAbbrev, rate, shortWMA, longWMA) => {
  const wmaData = {rate, shortWMA, longWMA};
  const wmaDataJSON = JSON.stringify(wmaData);

  const query = 'INSERT INTO currency_wma (abbrev, wma_data_json) VALUES ?';
  const queryValues = [
    [currencyAbbrev, wmaDataJSON]
  ];

  conn.query(query, [queryValues], (err, results) => {
    if (err) throw new Error('Error storing currency WMA data');
  });
}


exports.getWMAs = (currencyAbbrev, amount) => new Promise((resolve, reject) => {
  const query =  `
    SELECT date, wma_data_json
    FROM currency_wma
    WHERE abbrev = ?
    ORDER BY DATE DESC
    LIMIT ?`;
  const queryValues = [currencyAbbrev, amount];

  conn.query(query, queryValues, (err, results) => {
    if (err) reject(err);

    if (results.length === 0) return [];

    const dataPoints = [];
    results.forEach((result) => {
      const wmaData = JSON.parse(result.wma_data_json);
      const dataPoint = {
        date: result.date,
        ...wmaData
      };
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
    SELECT date, wma_data_json
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
        ...wmaData
      };
      dataPoints.push(dataPoint);
    });

    resolve(dataPoints);
  });
});
