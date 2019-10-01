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

  parsed.sort((a,b) => {
    return new Date(b.date) - new Date(a.date)
  })




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