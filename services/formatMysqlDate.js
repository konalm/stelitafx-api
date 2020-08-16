const moment = require('moment')

module.exports = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss')
