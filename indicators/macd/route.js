const controller = require('./controller')

module.exports = (app) => {
  app.route('/macd/:interval/currency/:currency/count/:count')
    .get(controller.getMacd)
  app.route('/macd/:prototypeNo/interval/:interval/currency/:currency/trade/:tradeUUID')
    .get(controller.getMacdItemsForTrade);
}