const express = require('express')
const app = express()
const port = 8000


app.get('/hello', (req, res) => res.send('Hello from Stelita FX api inside docker container LIVE!!'))

app.listen(port, () => console.log(`Stelita FX API listening in port ${port}`))
