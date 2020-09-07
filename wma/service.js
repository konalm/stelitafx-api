const db = require('../dbInstance')
const config = require('../config');
const tradeRepo = require('../trade/repository');
const getWMA = require('../services/getWMA');
const currencyRatesRepo = require('../currencyRates/repository');
const repo = require('./repository');
const currencyRatesService = require('../currencyRates/service');
const secondsBetweenDates = require('../services/secondsBetweenDates')
const getCurrencyRates = require('../currencyRates/services/getCurrencyRates')
const cacheWMA = require('./services/cacheWMAs')
const symbolToAbbrev = require('@/services/symbolToAbbrev');

const WMALengths = config.WMA_LENGTHS;

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
exports.storeWMAData = (timeInterval, isGran = false) => new Promise((resolve, reject) => {
  // console.log(`WMA Service .. store WMA data`)
  // console.log(timeInterval)
  // console.log(isGran)

  const conn = db()
  const s = new Date()

  storeCurrencyPromises = [];
  config.CURRENCYPAIRS.forEach((currencyPair) => {
    storeCurrencyPromises.push(
      storeCurrencyWMAData(symbolToAbbrev(currencyPair), timeInterval, conn, isGran)
    )
  })

  Promise.all(storeCurrencyPromises)
    .then(() => {
      conn.end()
      console.log( secondsBetweenDates(s) )
      resolve('sucessfully stored currencies');
    })
    .catch(err => {
      console.log('store wma fail :(')

      conn.end()
      console.log('FAILED TO STORE WMA DATA')
      reject(`Failed to store currencies: ${err}`);
    })
})


/**
 * Store all WMA lengths for currency 
 */
const storeCurrencyWMAData = (currencyAbbrev, timeInterval, conn, isGran = false) => 
  new Promise(async (resolve) =>
{
  let rateData 
  try {
    rateData = await getCurrencyRates(timeInterval, currencyAbbrev, 1, true)
  } catch (e) {
    console.log(e)
    // throw new Error('Error getting currency rate');
    resolve()
  }

  if (!rateData.length) return resolve('Could not calculate WMA data as no rates')
  
  const rate = rateData[0].exchange_rate

  wmaPromises = [];
  WMALengths.forEach((length) => {
    wmaPromises.push(calcWMA(currencyAbbrev, length, timeInterval));
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

      /* Store WMA data for interval and currency in MYSQL DB */
      if (!isGran) {
        try {
          await repo.storeWMAData(currencyAbbrev, rate, WMAData, timeInterval, conn)
        } catch (e) {
          console.error('Failed to store WMA data')
        }
      } else {
        try {
          await repo.storeWMADataWithGran(currencyAbbrev, rate, WMAData, timeInterval, conn)
        } catch (e) {
          console.log('Failed to store WMA data with gran')
        }
      }

      /* Store WMA data fir interval and currency in cache */ 
      try {
        await cacheWMA(timeInterval, currencyAbbrev, WMAData, rate)
      } catch (e) {
        console.error('Failed to cache WMA')
      }
      

      resolve('Stored Currency WMA data')
    })
    .catch(e => {
      console.log('FAILED to CALC WMA')
      console.log(e)
      throw new Error(e)
    })
});


/**
 * Calculate weighted moving average for passed length
 */
const calcWMA = async (abbrev, WMALength, timeInterval, conn) => {

  let currencyRates
  try {
    // currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
    //                         abbrev,
    //                         WMALength,
    //                         0,
    //                         timeInterval,
    //                         conn
    //                       );
    currencyRates = await getCurrencyRates(timeInterval, abbrev, WMALength, true)
  } catch (err) {
    console.log('Failed to get currency rates')
    // throw new Error('Error Getting WMA Data points: ' + err);
  }

  if (currencyRates.length < WMALength) return null;

  return currencyRatesService.calcWeightedMovingAverage(currencyRates);
}
 