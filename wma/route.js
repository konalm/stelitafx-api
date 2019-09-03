const controller = require('./controller');

module.exports = (app) => {
  app.route('/currency/:currency/weighted_moving_average/:movingAverageLength')
    .get(controller.getWMAs);

  app.route('/wma/:currency/trade/:tradeId').get(controller.getWMAsForTrade);

  app.route('/currency/:currency/int/:interval/wma-data-points/:count')
    .get(controller.getWMADataPoints);
}
