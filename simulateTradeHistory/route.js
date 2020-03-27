const controller = require('./controller')

module.exports = (app) => {
  app.route('/simulate-history/:interval/currency/:currency')
    .get(controller.simulateTradeHistory)
  
  app.route('/wma-simulate-history/:interval/currency/:currency')
    .get(controller.wmaTradeHistorySimulator)
}