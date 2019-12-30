const db = require('../dbInstance')
const config = require('../config');
const tradeRepo = require('../trade/repository');
const getWMA = require('../services/getWMA');
const currencyRatesRepo = require('../currencyRates/repository');
const repo = require('./repository');
const currencyRatesService = require('../currencyRates/service');
const dbConnections = require('../dbConnections')
const WMALengths = [5, 12, 15, 36, 200];


/**
 *
 */
exports.getTradeTransactions = (abbrev, buyId, sellId) =>
  new Promise(async (resolve, reject) =>
{
  let trades;
  try {
    trades = await Promise.all([
      tradeRepo.getTrade(abbrev, buyId, 'buy'),
      tradeRepo.getTrade(abbrev, sellId, 'sell')
    ]);
  } catch (err) {
    return reject({status: 500, data: 'Could not get trade transactions'});
  }

  const buy = trades[0];
  if (!buy) return reject({status: 404, data: 'could not get buy trade'});

  const sell = trades[1];
  if (!sell) return reject({status: 404, data: 'could not get sell trade'});

  if (buy.date >= sell.date) {
    return reject({
      status: 403,
      data: 'Buy trade date must be before sell trade date'
    });
  }

  resolve({status: 200, data: {buy, sell}});
});


/**
 *
 */
exports.getWMAsForTrade = (abbrev, date, historicWMAs) =>
  new Promise(async (resolve, reject) =>
{
  let shortWMADataPoints
  try {
    shortWMADataPoints =
      await getWMA.getWMAsAtDate(
        abbrev, 12, historicWMAs, date
      );
  } catch (err) {
    return reject({status: 500, data: 'Could not get short WMA data points'});
  }

  let longWMADataPoints
  try {
    longWMADataPoints =
      await getWMA.getWMAsAtDate(
        abbrev, 36, historicWMAs, date
      );
  } catch (err) {
    return reject({status: 500, data: 'Could not get long WMA data points'});
  }

  resolve({
    status: 200,
    data: {short: shortWMADataPoints, long: longWMADataPoints}
  });
});

/**
 *
 */
exports.storeWMAData = (timeInterval, currencyRateSource = 'currency_rate') => 
  new Promise((resolve, reject) => 
{
  const currencies = config.MAJOR_CURRENCIES;
  const quoteCurrency = config.QUOTE_CURRENCY;

  const conn = db()

  storeCurrencyPromises = [];
  currencies.forEach((currency) => {
    const currencyAbbrev = `${currency}/${quoteCurrency}`;
    storeCurrencyPromises.push(
      storeCurrencyWMAData(currencyAbbrev, timeInterval, conn)
    )
  })

  Promise.all(storeCurrencyPromises)
    .then(() => {
      conn.end()
      resolve('sucessfully stored currencies');
    })
    .catch(err => {
      conn.end()
      console.log('FAILED TO STORE WMA DATA')
      reject(`Failed to store currencies: ${err}`);
    })
})

/**
 *
 */
const storeCurrencyWMAData = (currencyAbbrev, timeInterval, conn) => 
  new Promise(async (resolve) =>
{
  console.log('store currency wma data')

  // await dbConnections('get currency latest rates for store WMA data')

  let rateData;
  try {
    rateData = await currencyRatesRepo.GetCurrencyLatestRates(
      currencyAbbrev, 
      1, 
      0,  
      timeInterval,
      conn
    )
  } catch (err) {
    console.log(err)
    throw new Error('Error getting currency rate');
  }
  const rate = rateData[0].exchange_rate;

  wmaPromises = [];
  WMALengths.forEach((length) => {
    wmaPromises.push(calcWMA(currencyAbbrev, length, timeInterval, conn));
  });

  Promise.all(wmaPromises)
    .then(async (values) => {
      const WMAData = [];
      WMALengths.forEach((length, index) => {
        WMADataPoint = {
          length,
          wma: values[index],
        }
        WMAData.push(WMADataPoint);
      });

      try {
        await repo.storeWMAData(
          currencyAbbrev, 
          rate, 
          WMAData, 
          timeInterval, 
          conn
        )
      } catch (err) {
        return resolve('Failed to store WMA data')
      }

      resolve('Stored Currency WMA data')
    })
    .catch(e => {
      console.log(e)
      throw new Error(e)
    })
});


/**
 * Calculate weighted moving average for passed length
 */
const calcWMA = async (abbrev, WMALength, timeInterval, conn) => {
  let currencyRates = [];
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                            abbrev,
                            WMALength,
                            0,
                            timeInterval,
                            conn
                          );
  } catch (err) {
    throw new Error('Error Getting WMA Data points: ' + err);
  }

  if (currencyRates.length < WMALength) return '';

  return currencyRatesService.calcWeightedMovingAverage(currencyRates);
}
