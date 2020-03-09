const tradeRepo = require('../trade/repository');
const currencyRateRepo = require('../currencyRates/repository');
const getWMA = require('../services/getWMA');
const groupWMADataPoints = require('../services/groupWMADataPoints');
const calculateWMAs = require('../services/calculateWMAs');
const service = require('./service');
const repo = require('./repository');
const tradeMongoRepo = require('../trade/mongoRepository');

/**
 * Get WMA data points start from passed date until now
 */
exports.getWMADataPointsStartDate = async (req, res) => {
  console.log('get wma data ports start date')

  const currencyPairAbbrev = `${req.params.currency}/USD`
  const {interval, startDate}  = req.params
  const toDate = req.query.toDate ? req.query.toDate : new Date()

  let WMADataPoints
  try {
    WMADataPoints = await repo.getWMAFromDate(
      currencyPairAbbrev, 
      interval, 
      startDate, 
      toDate
    )
  } catch (e) {
    console.log(e)
    return res.status(500).send('Error getting WMAs from date')
  }

  return res.send(WMADataPoints)
}


/**
 * Get Weighted moving average data
 */
 exports.getWMADataPoints = async (req, res) => {
  const currency = req.params.currency;
  const currencyPairAbbrev = `${currency}/USD`;
  const interval = req.params.interval
  const count = parseInt(req.params.count);
  const offset = parseInt(req.query.offset) || 0;
   const currencyRateSource = req.query.currencyRateSource === 'Fixer IO'
     ? 'fixerio_currency_rate'
     : 'currency_rate'

  let WMADataPoints;
  try {
    WMADataPoints = await repo.getWMAs(
      currencyPairAbbrev, 
      interval, 
      count, 
      offset,
      currencyRateSource
    );
  } catch (err) {
     return res.status(500).send('Error getting WMAs');
  }

  return res.send(WMADataPoints);
}


/**
 * Get latest weighted moving averages
 */
exports.getWMAs = async (req, res) => {
  const currency = req.params.currency;
  const currencyPairAbbrev = `${currency}/USD`
  const movingAverageLength = parseInt(req.params.movingAverageLength, 10);
  const historical = parseInt(req.query.historical, 10) || 0;
  let currencyRateSrc = 'currency_rate';
  if (req.query.currencyRateSource === 'Fixer IO') currencyRateSrc = 'fixerio_currency_rate'

  let currencyRates;
  try {
    currencyRates = await currencyRateRepo.GetCurrencyLatestRates(
                            currencyPairAbbrev,
                            movingAverageLength,
                            historical,
                            currencyRateSrc
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
  console.log('get wmas for trade')

  const { prototypeNumber, currency, tradeUUID } = req.params
  const interval = parseInt(req.params.interval)
  const abbrev = `${currency}/USD`;
  const abbrevInstrument = `${currency}_USD`

  let trade;
  try {
    trade = await tradeRepo.getTradeV2(abbrev, tradeUUID)
  } catch (err) {
    return res.status(500).send('could not get trade');
  }
  if (!trade) return res.status(404).send('could not find trade');


  let WMADataPoints;
  try {
    WMADataPoints =
      await repo.getWMAsBetweenDates(
        abbrev, 
        trade.openDate, 
        trade.closeDate, 
        interval,
        40
      );
  } catch (err) {
    return res.status(500).send('could not get WMAs between dates: ' + err);
  }

  return res.send(WMADataPoints);
}
