const tradeRepo = require('../trade/repository');
const getWMA = require('../services/getWMA');


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
