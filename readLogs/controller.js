const fs = require('fs')

exports.readLog = async (req, res) => {
  const {type} = req.params

  let log;
  try {
    log = await fs.readFileSync('./logs/oandaDemo.log').toString()
  } catch (err) {
    return res.status(500).send('failed to read log')
  }

  const parsed = []
  const array = log.split("}")
  array.forEach((a) => {
    let x = `${a}}`
    x = x.replace(/\\/g, '')

    let J;
    try {
      J = JSON.parse(x)
    } catch (err) {
      console.error(`PARSE failed`)
      console.error(x)
    }

    if (J) parsed.push(J)
  })

  parsed.sort((a,b) => new Date(b.date) - new Date(a.date))

  return res.send(parsed)
}


exports.readOandaActivityLog = async (req, res) => {
  let logString;
  try {
    logString = await fs.readFileSync('./logs/oandaActivity.log').toString()
  } catch (err) {
    return res.status(500).send('failed to read log')
  }

  let log;
  try {
    log = JSON.parse(logString)
  } catch (err) {
    return res.status(500).send(`Failed to parse log`)
  }

  return res.send(log)
}


exports.readPublishedTransactionLogs = async (req, res) => {
  let log
  try {
    log = JSON.parse(await fs.readFileSync('./logs/publishedTransactions.log', 'UTF8'))
  } catch (e) {
    return res.status(500).send('Failed to read published transaction logs')
  }

  log.sort((a,b) => {
    return new Date(b.date) - new Date(a.date)
  })

  const tradeGroupedLog = log.reduce((acc, x) => {
    if (!acc[x.tradeUUID]) acc[x.tradeUUID] = []
    acc[x.tradeUUID].push(x)
    return acc
  }, {})

  const tradeLogs = Object.entries(tradeGroupedLog)

  tradeLogs.forEach((x) => {
    console.log('-------------')
    console.log(x)
    console.log('-------------')
  })
  return res.send(tradeGroupedLog)
}