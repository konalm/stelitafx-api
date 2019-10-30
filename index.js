const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
const cron = require('node-cron')
const port = 8686
const routes = require('./routes');

/**
 *
 */
routes(app);


cron.schedule('*/5 * * * *', async () => {
  require('./oandaTransactionCacher')()
})


require('./crons')


app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
