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

   let WMADataPoints;
   try {
     WMADataPoints = await repo.getWMAs(currencyPairAbbrev, count);
   } catch (err) {
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
  const abbrev = `${req.params.currency}/USD`;
  const tradeId = req.params.tradeId;

  let trade;
  try {
    trade = await tradeRepo.getTradeV2(abbrev, tradeId)
  } catch (err) {
    return res.status(500).send('could not get trade');
  }
  if (!trade) return res.status(404).send('could not find trade');

  let WMADataPoints;
  try {
    WMADataPoints =
      await repo.getWMAsBetweenDates(abbrev, trade.openDate, trade.closeDate, 40);
  } catch (err) {
    return res.status(500).sen('could not get WMAs between dates: ' + err);
  }

  return res.send(WMADataPoints);
}
