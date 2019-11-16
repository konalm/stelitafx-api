const fs = require('fs')

/**
 * log trade transaction
 */
module.exports = async (abbrev, timeInterval, account, action) => {
  let logPath = './logs/';

  if (account === 'paper') logPath += 'paper.log'
  else if (account === 'demo') logPath += 'oandaDemo.log'
  else if (account === 'live') logPath += 'oandaLive.log'

  log = {
    date: new Date,
    abbrev,
    timeInterval,
    action
  }

  fs.appendFileSync(logPath, JSON.stringify(log), function (err) {
    if (err) console.error('Failed to log trade')
  })
}