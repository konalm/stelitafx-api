const tradeRepo = require('../trade/repository');
const currencyRateRepo = require('../currencyRates/repository');
const getWMA = require('../services/getWMA');
const groupWMADataPoints = require('../services/groupWMADataPoints');
const calculateWMAs = require('../services/calculateWMAs');
const service = require('./service');
const repo = require('./repository');

/**
 * Get Weighted moving average data
 */
 exports.getWMADataPointsV2 = async (req, res) => {
   const currency = req.params.currency;
   const currencyPairAbbrev = `${currency}/USD`;
   const count = parseInt(req.params.count);

   console.log(typeof(count))

   let WMADataPoints;
   try {
     WMADataPoints = await repo.getWMAs(currencyPairAbbrev, count);
   } catch (err) {
     console.log(err)
     return res.status(500).send('Error getting WMAs');
   }

   return res.send(WMADataPoints);
 }

/**
 * Get Weighted moving average data
 */
 exports.getWMADataPoints = async (req, res) => {
   const currency = req.params.currency;
   const currencyPairAbbrev = `${currency}/USD`;
   const count = parseInt(req.params.count);


   /* get rates */
   let currencyRates;
   try {
     currencyRates = await currencyRateRepo.GetCurrencyLatestRates(
                            currencyPairAbbrev,
                            count,
                            0
                          );
   } catch (err) {
     return res.status(500).send('Error getting currency rates');
   }

   historicalWMACount = count - 1;

   let shortWMADataPoints;
   try {
     shortWMADataPoints = await getWMA.getLatestWMAs(
                                  currencyPairAbbrev,
                                  12,
                                  historicalWMACount
                                );
   } catch (err) {
     return res.status(500).send('Error getting short WMA data points');
   }

   let longWMADataPoints;
   try {
     longWMADataPoints = await getWMA.getLatestWMAs(
                                 currencyPairAbbrev,
                                 36,
                                 historicalWMACount
                               );
   } catch (err) {
     return res.status(500).send('Error getting long WMA data points');
   }

   const dataPoints = groupWMADataPoints(currencyRates, shortWMADataPoints, longWMADataPoints);

   return res.send(dataPoints);
 }

/**
 * Get latest weighted moving averages
 */
exports.getWMAs = async (req, res) => {
  const currency = req.params.currency;
  const currencyPairAbbrev = `${currency}/USD`
  const movingAverageLength = parseInt(req.params.movingAverageLength, 10);
  const historical = parseInt(req.query.historical, 10) || 0;

  let currencyRates;
  try {
    currencyRates = await currencyRateRepo.GetCurrencyLatestRates(
                           currencyPairAbbrev,
                           movingAverageLength,
                           historical
                         );
  } catch (err) {
    return res.status(500).send('Error getting currency rates');
  }

  let wmaDataPoints = calculateWMAs(currencyRates, movingAverageLength, historical);

  return res.send({
    abbrev: currencyPairAbbrev,
    baseCurrency: currency,
    weightWMADataPoints: wmaDataPoints
  });
}


/**
 * Get the weighted moving averages of currency rates between a buy and sell trade
 * (including buffer)
 */
exports.getWMAsForTrade = async (req, res) => {
  console.log('get WMAs for trade');
  const abbrev = `${req.params.currency}/USD`;
  const buyTradeId = req.params.buy_trade_id;
  const sellTradeId = req.params.sell_trade_id;

  let tradeTransaction;
  try {
    tradeTransaction = await service.getTradeTransactions(
                               abbrev,
                               buyTradeId,
                               sellTradeId
                             );
  } catch (err) {
    console.log(err)
    return res.status(500).send('could not get trade transaction');
  }

  if (tradeTransaction.status !== 200) {
    return res.status(tradeTransaction.status).send(tradeTransaction.data);
  }

  const buyTrade = tradeTransaction.data.buy;
  const sellTrade = tradeTransaction.data.sell;

  let currencyRates;
  try {
    currencyRates = await currencyRateRepo.getCurrencyRatesBetweenDateRange(
                            abbrev,
                            buyTrade.date,
                            sellTrade.date,
                            20
                          );
  } catch (err) {
    return res.status(500).send('Could not get currency rates');
  }

  const latestCurrencyDate = currencyRates[0].date;
  const historicWMAs = currencyRates.length - 1;

  let wmaDataPoints;
  try {
    wmaDataPoints = await service.getWMAsForTrade(
                            abbrev,
                            latestCurrencyDate,
                            historicWMAs
                          );
  } catch (err) {
    return res.status(500).send('Error getting WMA data points');
  }

  const WMADataPoints = groupWMADataPoints(
                          currencyRates,
                          wmaDataPoints.data.short,
                          wmaDataPoints.data.long
                        );
  return res.send(WMADataPoints);
}


/**
 * Get the weighted moving averages of currency rates between a buy and sell trade
 * (including buffer)
 */
exports.getWMAsForTradeV2 = async (req, res) => {
  console.log('get WMAs for trade');
  const abbrev = `${req.params.currency}/USD`;
  const buyTradeId = req.params.buy_trade_id;
  const sellTradeId = req.params.sell_trade_id;

  let tradeTransaction;
  try {
    tradeTransaction = await service.getTradeTransactions(
                               abbrev,
                               buyTradeId,
                               sellTradeId
                             );
  } catch (err) {
    console.log(err)
    return res.status(500).send('could not get trade transaction');
  }

  if (tradeTransaction.status !== 200) {
    return res.status(tradeTransaction.status).send(tradeTransaction.data);
  }

  const buyTrade = tradeTransaction.data.buy;
  const sellTrade = tradeTransaction.data.sell;

  let WMADataPoints;
  try {
    WMADataPoints = await repo.getWMAsBetweenDates(abbrev, buyTrade.date, sellTrade.date, 15);
  } catch (err) {
    return res.status(500).sen('could not get WMAs between dates: ' + err);
  }

  return res.send(WMADataPoints);
}
