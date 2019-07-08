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
const groupWMADataPoints = require('./services/groupWMADataPoints');
const routes = require('./routes');

console.log('ENV variable >>>')
console.log(process.env.STAGE);


/**
 *
 */
routes(app);



/**
 *
 */
app.get('/algo/:algo_id/currency/:currency', async (req, res) => {
  console.log('get currency trades !!');

  const algoId = req.params.algo_id;
  const baseCurrency = req.params.currency;
  const currencyPairAbbrev = `${baseCurrency}/USD`;
  const dateTimeFilter = req.query.date || '';

  let trades;
  try {
    trades = await tradeRepo.getCurrencyTrades(algoId, currencyPairAbbrev, dateTimeFilter);
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
 * Get currencies rates
 */
app.get('/currency/:abbrev/rates/:count', async (req, res) => {
  console.log('get currencies rates !!');

  const currencyPairAbbrev = `${req.params.abbrev}/USD`
  const ratesAmount = parseInt(req.params.count);

  let rates;
  try {
    rates = await currencyRatesRepo.getCurrenciesRates(currencyPairAbbrev, ratesAmount);
  } catch (err) {
    console.log('ERROR !!!!')
    console.log(err)
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


/**
 *
 */
cron.schedule('* * * * *', () => {
  insertCurrencyRates()
    .then(() => {
      prototype();
      connor();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.get('/hello', (req, res) => res.send('Hello from Stelita FX api inside docker container LIVE!!'))

app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
