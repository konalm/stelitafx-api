const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors());
const cron = require('node-cron')
const port = 8686
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates');
const wmaService = require('./wma/service');
const routes = require('./routes');


/**
 *
 */
routes(app);


/**
 *
 */
cron.schedule('* * * * *', async () => {
  try {
    await insertCurrencyRates();
  } catch (err) {
    throw new Error('Error inserting currency rates');
  }
});

require('./crons')


app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
