const controller = require('./controller')

module.exports = (app) => {
  app.route('/oanda-trade-sim/:transaction/:currency')
     .get(controller.simulateOandaTrade);
  app.route('/trade-sim/:transaction/proto/:protoNo/currency/:currency')
     .get(controller.simulateTrade);
}

