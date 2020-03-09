const conn = require('../db');
const retrieveCurrencyRates = require('./retrieveCurrencyRates');
const config = require('../config');
const db = require('../dbInstance')
const dbConnections = require('../dbConnections')
const xtbService = require('../xtb/service')
const { insertCurrencyRateData } = require('../currencyRates/repository')
const { cacheRates } = require('../currencyRates/service')
const cacheCurrencyRates = require('../currencyRates/cacheCurrencyRates')


module.exports = (date) => new Promise(async (resolve, _) => {
  console.log('insert currency rate')

  Promise.all([
    uploadXTBAccountCurrencyRates(date)
    // uploadOandaFXAccountCurrencyRates(date)
    // uploadFixerioCurrencyRates()
  ])
    .then(() => { resolve() })
    .catch(() => { resolve() })
})


/**
 * 
 */
const uploadOandaFXAccountCurrencyRates = (date) => new Promise(async (resolve, reject) => {
  console.log('upload oanda fx account currency rates')

  let oandaCurrencyRates;
  try {
    oandaCurrencyRates = await retrieveCurrencyRates.oandaFXAccountRate()
  } catch (e) {
    console.error(e)
    return reject ('Unable to retrieve currency rates')
  }

  // console.log('oanda currency rates >>')
  // console.log(oandaCurrencyRates)


  const currencyRates = []
  for (const key in oandaCurrencyRates) {
    const currencyRate = {
      currency: key,
      bid: oandaCurrencyRates[key],
      ask: oandaCurrencyRates[key],
      high: oandaCurrencyRates[key],
      low: oandaCurrencyRates[key]
    }
    currencyRates.push(currencyRate)
  }

  console.log('currency rates >>')
  console.log(currencyRates)

  try {
    await insertCurrencyRates(currencyRates, 'currency_rate')
  } catch (e) {
    console.error(e)
    return reject ('Failed to insert oandafx account currency rates')
  }

  try {
    await cacheCurrencyRates(date, currencyRates)
  } catch (e) {
    console.log('Failed to cache currency rates')
  }

  resolve()
})


/**
 * 
 */
const uploadXTBAccountCurrencyRates = (date) => new Promise(async (resolve, reject) => {
  let xtbCurrencyRates
  try {
    xtbCurrencyRates = await xtbService.getCurrencyRates()
  } catch (e) {
    return reject('Failed to retrieve currency rates from xtb')
  }

  let currencyRates = []
  xtbCurrencyRates.forEach((x) => {
    const currency = x.symbol.substring(0, 3)
    const currencyRate = {
      currency,
      bid: x.bid,
      ask: x.ask,
      high: x.high,
      low: x.low
    }
    currencyRates.push(currencyRate)
  })

  try {
    await insertCurrencyRates(currencyRates, 'currency_rate')
  } catch (e) {
    return reject('Failed to insert currency rates from xtb account')
  }

  try {
    await cacheCurrencyRates(date, currencyRates)
  } catch (e) {
    console.log('Failed to cache currency rates')
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
  const query = `INSERT INTO ${tableName} (abbrev, exchange_rate, bid, ask, high, low) VALUES ?`
  const queryValues = []

  /* build row of data in sql query */
  currencyRates.forEach((x) => {
    const abbrev = `${x.currency}/USD`;
    const row = [abbrev, x.bid,x.bid, x.ask, x.high, x.low]
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
    dbConn.end()
    if (e) return reject(err);

    resolve();
  })
})
