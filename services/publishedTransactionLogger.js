const fs = require('fs')

module.exports = async (status, transaction, platform, abbrev, tradeUUID) => {
  const logPath = './logs/publishedTransactions.log'
  
  let logString = ''
  try {
    logString = await fs.readFileSync(logPath).toString()
  } catch (e) {
    console.error(`Failed`)
  }
  
  let log = []
  if (logString) {
    try {
      log = JSON.parse(logString)
    } catch (e) {
      console.error(`Failed to parse published transaction log string: ${e}`)
      return
    }
  }
    
  const event = {
    status,
    transaction,
    platform,
    abbrev,
    tradeUUID,
    date: new Date()
  }
  log.push(event)


  try {
    await fs.writeFileSync(logPath, JSON.stringify(log))
  } catch (e) {
    console.error(`Failed to write to file: ${e}`)
  }
}