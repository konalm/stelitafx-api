const config = require('../config');
const tradeRepo = require('../trade/repository');
const getWMA = require('../services/getWMA');
const currencyRatesRepo = require('../currencyRates/repository');
const calculateWMAs = require('../services/calculateWMAs');
const repo = require('./repository');
const currencyRatesService = require('../currencyRates/service');

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

exports.storeWMAData = () => {
  console.log('store WMA Data');
  const currencies = config.MAJOR_CURRENCIES;
  const quoteCurrency = config.QUOTE_CURRENCY;

  currencies.forEach((currency) => {
    console.log('currency ' + currency)
    const currencyAbbrev = `${currency}/${quoteCurrency}`;

    storeCurrencyWMAData(currencyAbbrev)
  })
}

/**
 *
 */
const storeCurrencyWMAData = async (currencyAbbrev) => {
  console.log('save wma !!');

  let rate;
  try {
    rate = await currencyRatesRepo.GetCurrencyLatestRates(currencyAbbrev, 1, 0)
  } catch (err) {
    throw new Error('Error getting currency rate');
  }
  rate = rate[0].exchange_rate;

  let shortWMA;
  try {
    shortWMA = await calcWMA(currencyAbbrev, 12);
  } catch (err) {
    throw new Error('Error calculating short WMA: ' + err);
  }

  let longWMA;
  try {
    longWMA = await calcWMA(currencyAbbrev, 36);
  } catch (err) {
    throw new Error('Error calculating long WMA: ' + err);
  }


  repo.storeWMAData(currencyAbbrev, rate, shortWMA, longWMA);
}

/**
 *
 */
const calcWMA = async (abbrev, WMALength) => {
  const historical = 5;

  let currencyRates = [];
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                            abbrev,
                            WMALength,
                            0,
                          );
  } catch (err) {
    throw new Error('Error Getting WMA Data points: ' + err);
  }

  return currencyRatesService.calcWeightedMovingAverage(currencyRates);
}
