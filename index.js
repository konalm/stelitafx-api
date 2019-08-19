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
const prototypeNo3 = require('./algorithms/prototype#3');
const prototypeNo4 = require('./algorithms/prototype#4');
const prototypeNo5 = require('./algorithms/prototype#5');
const prototypeNo6 = require('./algorithms/prototype#6');
const prototypeNo7 = require('./algorithms/prototype#7');

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

  try {
    await wmaService.storeWMAData();
  } catch (err) {
    throw new Error("Error storing WMA data: " + err);
  }

  console.log('looking at prototypes >>>')

  prototype()
  prototypeNo2()
  prototypeNo3()
  prototypeNo4()
  prototypeNo5()
  prototypeNo6()
  prototypeNo7()
});

app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
