const currencyRatesRepo = require('../currencyRates/repository');
const getWMA = require('../services/getWMA');
const groupWMADataPoints = require('../services/groupWMADataPoints');
const calculateWMAs = require('../services/calculateWMAs');
const tradeRepo = require('../trade/repository');
const prototypeRepo = require('../proto/repository');
const wmaRoutes = require('../wma/route');
const protoRoutes = require('../proto/route');
const tradeRoutes = require('../trade/route');

module.exports = (app) => {
  wmaRoutes(app);
  protoRoutes(app);
  tradeRoutes(app);

  /**
   * Get trade
   */
  app.get('/algo/:algo_id/currency/:currency/trade/:trade_id', async (req, res) => {
    const algoId = req.params.algo_id;
    const baseCurrency = req.params.currency;
    const currencyPairAbbrev = `${baseCurrency}/USD`;
    const tradeId = req.params.trade_id;

    let trade;
    try {
      trade = await tradeRepo.getAlgoCurrencyTrade(algoId, currencyPairAbbrev, tradeId);
    } catch (err) {
      return res.status(500).send('Error getting trade');
    }

    if (!trade) return res.status(204).send('Could not get trade')

    return res.send(trade);
  });


  /**
   *
   */
  app.get('/currency/:abbrev/rate', async (req, res) => {
    const currencyPairAbbrev = `${req.params.abbrev}/USD`

    let rate;
    try {
      rate = await currencyRatesRepo.getCurrencyRate(currencyPairAbbrev);
    } catch (err) {
      return res.status(500).send(err);
    }

    return res.send(rate);
  });

  /**
   * Get currencies rates
   */
  app.get('/currency/:abbrev/rates/:count', async (req, res) => {
    const currencyPairAbbrev = `${req.params.abbrev}/USD`
    const ratesAmount = parseInt(req.params.count);

    let rates;
    try {
      rates = await currencyRatesRepo.getCurrenciesRates(currencyPairAbbrev, ratesAmount);
    } catch (err) {
      return res.status(500).send(err);
    }

    return res.send(rates);
  })


  /**
   *
   */
  app.get('/currency-pairs-latest-rates', async (req, res) => {
    let latestRates;
    try {
      latestRates = await currencyRatesRepo.GetCurrencyPairsAndLatestRate;
    } catch (err) {
      return res.status(500).send(err);
    }

    return res.send(latestRates);
  });
}
