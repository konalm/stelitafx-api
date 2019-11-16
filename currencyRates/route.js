const controller = require ('./controller');

module.exports = (app) => {
  app.route('/multi-rates').get(controller.getMultiRates)
  app.route('/currency-rate-sources').get(controller.getCurrencyRateSources)
}