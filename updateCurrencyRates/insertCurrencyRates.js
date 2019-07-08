const conn = require('../db');
const retrieveCurrencyRates = require('./retrieveCurrencyRates');


module.exports = () => new Promise(async (resolve, reject) => {
  console.log('Insert currency rates !!');
  let currentRates;

  try {
   // currencyRates = await retrieveCurrencyRates.exchangeRatesAPI();
   currencyRates = await retrieveCurrencyRates.fixerAPI();
  } catch(err) {
    console.log(err)
    throw new Error('Unable to retrieve currency rates');
  }

  console.log('currency rates from fixer API >>>>')
  console.log(currencyRates)

  console.log('retrieved currency rates from third party api');
  console.log(currencyRates);

  const query = "INSERT INTO currency_rate (abbrev, exchange_rate) VALUES ?";
  const queryValues = [];


  /* build row of data in sql query */
  for (let [key, value] of Object.entries(currencyRates)) {
    const abbrev = `${key}/USD`;
    queryValues.push([abbrev, value]);
  }

  conn.query(query, [queryValues], (err, result) => {
    if (err) {
      return reject(err);
    } else {
      console.log('INSERTED CURRENCY RATES');
    }

    resolve();
  });
})
