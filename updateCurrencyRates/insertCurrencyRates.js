const conn = require('../db');
const retrieveCurrencyRates = require('./retrieveCurrencyRates');
const config = require('../config');
const db = require('../dbInstance')
const dbConnections = require('../dbConnections')


module.exports = () => new Promise(async (resolve, _) => {
  Promise.all([
    uploadOandaFXAccountCurrencyRates(), 
    // uploadFixerioCurrencyRates()
  ])
    .then(() => { resolve() })
    .catch(() => { resolve() })
})


/**
 * 
 */
const uploadOandaFXAccountCurrencyRates = () => new Promise(async (resolve, reject) => {
  let currencyRates;
  try {
    currencyRates = await retrieveCurrencyRates.oandaFXAccountRate()
  } catch (e) {
    console.error(e)
    return reject ('Unable to retrieve currency rates')
  }

  try {
    await insertCurrencyRates(currencyRates, 'currency_rate')
  } catch (e) {
    console.error(e)
    return reject ('Failed to insert oandafx account currency rates')
  }

  resolve()
})


/**
 * 
 */
const uploadFixerioCurrencyRates = () => new Promise(async (resolve, reject) => {
  let currencyRates
  try {
    currencyRates = await retrieveCurrencyRates.fixerAPI()
  } catch (e) {
    console.error(e)
    return reject('Failed to retrieve currency rates from Fixerio')
  }

  try {
    await insertCurrencyRates(currencyRates, 'fixerio_currency_rate')
  } catch (e) {
    return reject('Failed to insert fixerio currency rates')
  }

  resolve()
})


const insertCurrencyRates = (currencyRates, tableName) => 
  new Promise(async (resolve, reject) => 
{
  // await dbConnections('before inserting currency rates')

  const query = `INSERT INTO ${tableName} (abbrev, exchange_rate) VALUES ?`
  const queryValues = []

  /* build row of data in sql query */
  for (let [key, value] of Object.entries(currencyRates)) {
    const abbrev = `${key}/USD`;
    queryValues.push([abbrev, value]);
  }


  const dbConn = db()
  dbConn.query(query, [queryValues], (err, result) => {
    if (err) return reject(err);

    resolve()
  })
  dbConn.end()
})


const insertMultiRates = (currencyRates) => new Promise(async (resolve, reject) => {
  const query = `
    INSERT INTO multi_rate (
      abbrev, oanda_demo_rate, fixerio_rate, oanda_fxaccount_rate
    ) VALUES ?
  `
  let currencyRateFromFixer
  try {
    currencyRateFromFixer = await retrieveCurrencyRates.fixerAPI()
  } catch (err) {
    console.error('currency rate from fixer failed');
  }

  let currencyRateFromOandaFXAccount
  try {
    currencyRateFromOandaFXAccount = await retrieveCurrencyRates.oandaFXAccountRate()
  } catch (e) {
    console.error('failed to get currency rate from oanda fx account')
  }

  let queryValues = []
  config.MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/USD`
    queryValues.push([
      abbrev, 
      currencyRates[currency],
      currencyRateFromFixer[currency],
      currencyRateFromOandaFXAccount
    ])
  })

  const dbConn = db()
  dbConn.query(query, [queryValues], (e) => {
    if (e) return reject(err);

    resolve();
  })
  dbConn.end()
})
