const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors());
const cron = require('node-cron')
const port = 8000
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates');
const currencyRatesRepo = require('./currencyRates/repository');
const currencyRatesService = require('./currencyRates/service');

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

  let currencyRates;
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                           currencyPairAbbrev,
                           movingAverageLength
                         );
  } catch (err) {
    return res.status(500).send(err);
  }

  const wma = currencyRatesService.calcWeightedMovingAverage(currencyRates);

  return res.send({
    abbrev: currencyPairAbbrev,
    baseCurrency: currency,
    movingAverageLength: movingAverageLength,
    weightedMovingAverage: wma
  });
});

cron.schedule('0 * * * *', () => insertCurrencyRates());

app.get('/hello', (req, res) => res.send('Hello from Stelita FX api inside docker container LIVE!!'))

app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
