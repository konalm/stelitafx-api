const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors());
const cron = require('node-cron')
const port = 8000
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates');
const currencyRatesRepo = require('./currencyRates/repository');
const currencyRatesService = require('./currencyRates/service');
const calculateWMAs = require('./services/calculateWMAs');
const prototype = require('./algorithms/prototype');
const prototypeRepo = require('./proto/repository');
const tradeRepo = require('./trade/repository');

prototype();


/**
 *
 */
app.get('/algo/:algo_id/currency/:currency', async (req, res) => {
  const algoId = req.params.algo_id;
  const baseCurrency = req.params.currency;
  const currencyPairAbbrev = `${baseCurrency}/USD`;

  let trades;
  try {
    trades = await tradeRepo.getCurrencyTrades(algoId, currencyPairAbbrev);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }

  return res.send(trades);
});

/**
 *
 */
app.get('/protos', async (req, res) => {
  let protos;
  try {
    protos = await prototypeRepo.getProtos;
  } catch (err) {
    return res.status(500).send(err);
  }

  return res.send(protos);
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

/**
 *
 */
app.get('/currency/:currency/weighted_moving_average/:movingAverageLength',
  async (req, res) =>
{
  const currency = req.params.currency;
  const currencyPairAbbrev = `${currency}/USD`
  const movingAverageLength = parseInt(req.params.movingAverageLength, 10);
  const historical = parseInt(req.query.historical, 10) || 0;

  let currencyRates;
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                           currencyPairAbbrev,
                           movingAverageLength,
                           historical
                         );
  } catch (err) {
    return res.status(500).send(err);
  }

  let wmaDataPoints = calculateWMAs(currencyRates, movingAverageLength, historical);

  return res.send({
    abbrev: currencyPairAbbrev,
    baseCurrency: currency,
    weightWMADataPoints: wmaDataPoints
  });
});

cron.schedule('0 * * * *', () => {
  insertCurrencyRates
    .then(() => {
      prototype();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.get('/hello', (req, res) => res.send('Hello from Stelita FX api inside docker container LIVE!!'))

app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
