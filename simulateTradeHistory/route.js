const controller = require('./controller')

module.exports = (app) => {
  app.route('/simulate-performance').get(controller.simulatePerformance)
  
  app.route('/simulate-history')
    .get(controller.simulateTradeHistory)
  
  app.route('/wma-simulate-history/:interval/currency/:currency')
    .get(controller.wmaTradeHistorySimulator)
  
  app.route('/stochastic-simulate-history/:interval/currency/:currency')
    .get(controller.stochasticTradeHistorySimulator)
  
  app.route('/wmaover-stats/:abbrev').get(controller.getWmaCrossedOverStats)
  app.route('/stochastic-stats/:abbrev').get(controller.getStochasticStats)
  app.route('/ratewma-stochastic-stats/:abbrev').get(controller.getRateAboveWmaStochasticStats)
  app.route('/wmaover-stochastic-stats/:abbrev').get(controller.getWmaCrossedOverStochasticStats)
  app.route('/cached-calc-periods/:gran').get(controller.getCachedCalcPeriods)
  app.route('/candle-pattern-simulator/:abbrev').get(controller.candlePatternSimulator)
}