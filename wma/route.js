const controller = require('./controller');

module.exports = (app) => {
  app.route('/currency/:currency/wma-data-points/:count')
    .get(controller.getWMADataPointsV2);

  app.route('/currency/:currency/weighted_moving_average/:movingAverageLength')
    .get(controller.getWMAs);

  app.route('/wma/:currency/buy/:buy_trade_id/sell/:sell_trade_id')
    .get(controller.getWMAsForTradeV2);
}
