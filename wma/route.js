const controller = require('./controller');

module.exports = (app) => {
  app.route('/currency/:currency/weighted_moving_average/:movingAverageLength')
    .get(controller.getWMAs);

  app.route('/wma/:prototypeNumber/interval/:interval/:currency/trade/:tradeUUID')
    .get(controller.getWMAsForTrade);

  app.route('/currency/:currency/int/:interval/wma-data-points/:count')
    .get(controller.getWMADataPoints);
  
  app.route('/wma-data-points-from-date/:currency/interval/:interval/start-date/:startDate')
    .get(controller.getWMADataPointsStartDate);
  
  app.route('/wma-performances').get(controller.getWmaPerformances);
}
