const controller = require ('./controller');

module.exports = (app) => {
  app.route('/multi-rates').get(controller.getMultiRates)
  app.route('/currency-rate-sources').get(controller.getCurrencyRateSources)
  app.route('/xtb-prices-from-date/:currency/start-date/:startDate')
    .get(controller.getXTBRatesFromDate)
  app.route('/currency/:currency/xtb-rates/:count')
    .get(controller.getXTBRates)
  app.route('/volatility/:currency').get(controller.getVolatility)
}