const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

require('module-alias/register')


const port = 8686
const routes = require('./routes');

/**
 *
 */
routes(app);


// require('./crons')


app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
