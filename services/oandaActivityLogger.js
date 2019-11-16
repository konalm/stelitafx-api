const fs = require('fs');

module.exports = async (abbrev, message, state) => {
  const logPath = './logs/oandaActivity.log'

  /* get activity log as readable string from file */
  let activityLogString = ''
  try {
    activityLogString = await fs.readFileSync(logPath).toString()
  } catch (err) {
    console.error(`Failed to string from oanda activity log: ${err}`)
    return
  }
  
  /* parse readable acivity string to a strucure an array to be mutated */
  let activityLog = []
  if (activityLogString) {
    try {
      activityLog = JSON.parse(activityLogString)
    } catch(e) {
      console.error(`Failed to parse actvity log string: ${e}`)
      return
    }
  }
 
  /* add event and write changes to file */ 
  const event = {
    date: new Date(),
    abbrev,
    state,
    message
  };

  activityLog.push(event)

  try {
    await fs.writeFileSync(logPath, JSON.stringify(activityLog))
  } catch (e) {
    console.error(`Failed to write to file: ${e}`)
  }
}