const conn = require('../db')
const uuidGen = require('uuid/v1')


exports.getLastStep = (prototypeNo, interval, abbrev) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT step, story_id AS storyId
    FROM trade_story
    WHERE prototype_no = ?
      AND time_interval = ?
      AND abbrev= ?
      AND closed = false
    ORDER BY date DESC
    LIMIT 1
  `
  const queryValues = [prototypeNo, interval, abbrev]

  conn.query(query, queryValues, (e, results) => {
    if (e) {
      return reject(`Failed to get current step from
        mysql for ${prototypeNo}, ${interval}, ${abbrev}`
      )
    }

    if (!results.length) resolve(null)
    else resolve(results[0])
  })
})


exports.createTradeStoryStep = (algorithm, storyId, step, closed) => 
  new Promise((resolve, reject) => 
{
  const { prototype, interval, abbrev } = algorithm
  const query = "INSERT INTO trade_story SET ?"
  const data = {
    prototype_no: prototype,
    time_interval: interval,
    abbrev,
    step,
    story_id: storyId,
    closed
  }
  conn.query(query, data, (e, _) => {
    if (e) return reject(`Failed to insert trade story into MYSQL: ${e}`)

    resolve(`Inserted trade story successfully`)
  })
})

exports.closeTradeStory = (storyId) => new Promise((resolve, reject) => {
  const query = "UPDATE trade_story SET closed = true WHERE story_id = ?"
  conn.query(query, [storyId], (e) => {
    if (e) return reject('Failed to update trade story to closed')

    resolve('successfully closed trade story')
  })
})


