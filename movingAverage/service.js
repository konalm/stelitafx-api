const config = require('../config');
const repo = require('./repository')
const db = require('../dbInstance')
const currencyRatesRepo = require('../currencyRates/repository');
const MALengths = [9]


exports.storeMovingAverageData = (interval, currencyRateSrc = 'currency_rate') => 
  new Promise((resolve, reject) => 
{
  const currencies = config.MAJOR_CURRENCIES
  const quoteCurrency = config.QUOTE_CURRENCY

  const conn = db()

  storeCurrencyPromises = [];
  currencies.forEach((currency) => {
    const abbrev = `${currency}/${quoteCurrency}`;
    storeCurrencyPromises.push(
      storeCurrencyMovingAverageData(abbrev, interval, conn)
    )
  })

  Promise.all(storeCurrencyPromises)
  .then(() => {
    conn.end()
    resolve('sucessfully stored currencies');
  })
  .catch(e => {
    console.log(e)
    conn.end()
    console.log('FAILED TO STORE MA DATA')
    reject(`Failed to store currencies: ${e}`);
  })
})


/**
 * 
 */
const storeCurrencyMovingAverageData = (abbrev, interval, conn) => 
  new Promise(async (resolve, reject) => 
{
  console.log('store currency MA data')

  let rateData
  try {
    rateData = await currencyRatesRepo.GetCurrencyLatestRates(
      abbrev, 
      1, 
      0,  
      interval,
      conn
    )
  } catch (err) {
    console.log(err)
    throw new Error('Error getting currency rate');
  }
  const rate = rateData[0].exchange_rate;

  movingAveragePromises = []
  MALengths.forEach((length) => {
    movingAveragePromises.push(calcMovingAverage(abbrev, length, interval, conn))
  })

  Promise.all(movingAveragePromises)
    .then(async (values) => {
      console.log('values >>')
      console.log(values)

      const movingAverageData = []
      MALengths.forEach((length, index) => {
        movingAverageData.push({ length, movingAverage: values[index] })
      })

      try {
        await repo.storeMovingAverageData(
          abbrev,
          rate,
          movingAverageData,
          interval,
          conn
        )
      } catch (e) {
        console.log(e)
        return reject('Failed to store moving average data')
      }

      resolve('Stored currency moving average data')
    })
    .catch(e => {
      console.log(e)
      throw new Error(e)
    })
})


/**
 * Calculate moving average for passed length
 */
const calcMovingAverage = async (abbrev, MALength, interval, conn) => {
  console.log('calculate moving average')

  let rates = [];
  try {
    rates = await currencyRatesRepo.GetCurrencyLatestRates(
                            abbrev,
                            MALength,
                            0,
                            interval,
                            conn
                          );
  } catch (err) {
    throw new Error('Error Getting WMA Data points: ' + err);
  }

  if (rates.length < MALength) return '';

  const sumOfRates = rates.reduce((acc, x) => acc + x.exchange_rate, 0)

  return sumOfRates / rates.length
}
