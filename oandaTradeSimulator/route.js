const controller = require('./controller')

module.exports = (app) => {
  app.route('/trade-sim/:transaction/:currency').get(controller.simulateTrade)
}