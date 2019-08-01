const controller = require('./controller');

module.exports = (app) => {
  app.route('/currency/:currency/wma-data-points/:count')
    .get(controller.getWMADataPointsV2);

  app.route('/currency/:currency/weighted_moving_average/:movingAverageLength')
    .get(controller.getWMAs);

  app.route('/wma/:currency/trade/:tradeId').get(controller.getWMAsForTrade);
}
