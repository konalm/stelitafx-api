const conn = require('../db');
const retrieveCurrencyRates = require('./retrieveCurrencyRates');


module.exports = () => new Promise(async (resolve, reject) => {
  let currentRates;

  try {
   currencyRates = await retrieveCurrencyRates.fixerAPI();
  } catch(err) {
    throw new Error('Unable to retrieve currency rates');
  }

  const query = "INSERT INTO currency_rate (abbrev, exchange_rate) VALUES ?";
  const queryValues = [];

  /* build row of data in sql query */
  for (let [key, value] of Object.entries(currencyRates)) {
    const abbrev = `${key}/USD`;
    queryValues.push([abbrev, value]);
  }

  conn.query(query, [queryValues], (err, result) => {
    if (err) return reject(err);

    resolve();
  });
})
