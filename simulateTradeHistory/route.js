const controller = require('./controller')

module.exports = (app) => {
  app.route('/simulate-history/:interval/currency/:currency')
    .get(controller.simulateTradeHistory)
  
  app.route('/wma-simulate-history/:interval/currency/:currency')
    .get(controller.wmaTradeHistorySimulator)
  
  app.route('/stochastic-simulate-history/:interval/currency/:currency')
    .get(controller.stochasticTradeHistorySimulator)
  
  app.route('/stochastic-stats').get(controller.getStochasticStats)
  app.route('/ratewma-stochastic-stats').get(controller.getRateAboveWmaStochasticStats)
  app.route('/wmaover-stochastic-stats').get(controller.getWmaCrossedOverStochasticStats)
  app.route('/cached-calc-periods').get(controller.getCachedCalcPeriods)
}