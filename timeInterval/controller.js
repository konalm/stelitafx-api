const config = require('../config')

exports.getTimeIntervals = async (req, res) => {
  return res.send(config.TIME_INTERVALS)
}