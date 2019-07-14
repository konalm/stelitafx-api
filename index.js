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


/**
 *
 */
routes(app);


/**
 *
 */
cron.schedule('* * * * *', () => {
  insertCurrencyRates()
    .then(() => {
      prototype();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
