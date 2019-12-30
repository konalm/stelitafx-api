const controller = require('./controller')

module.exports = (app) => {
  app.route('/trade-sim/:transaction/currency/:currency').get(controller.simulateTrade);
}

