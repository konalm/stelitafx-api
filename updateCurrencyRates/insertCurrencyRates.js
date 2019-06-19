const conn = require('../db');
const retrieveCurrencyRates = require('./retrieveCurrencyRates');


module.exports = async () => {
  let currentRates;

  try {
   currencyRates = await retrieveCurrencyRates.exchangeRatesAPI();
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
    if (err) throw new Error('Unable to insert currency rates');
  });
}
