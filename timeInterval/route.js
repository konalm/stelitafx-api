const controller = require('./controller.js')

module.exports = (app) => {
  app.route('/intervals').get(controller.getTimeIntervals)
}