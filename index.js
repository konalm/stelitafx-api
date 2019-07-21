const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors());
const cron = require('node-cron')
const port = 8000
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates');
const wmaService = require('./wma/service');
const routes = require('./routes');

const prototype = require('./algorithms/prototype');
const prototypeNo2 = require('./algorithms/prototype#2');


/**
 *
 */
routes(app);

// prototypeNo2()


/**
 *
 */
cron.schedule('* * * * *', async () => {
  // try {
  //   await insertCurrencyRates();
  // } catch (err) {
  //   throw new Error('Error inserting currency rates');
  // }
  //
  // try {
  //   await wmaService.storeWMAData();
  // } catch (err) {
  //   throw new Error("Error storing WMA data: " + err);
  // }
  //
  // prototype()
  // prototypeNo2()
});

app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
