const controller = require('./controller')


module.exports = (app) => {
  app.route('/candle/:interval/currency/:currency/count/:count').get(controller.getCandles)
  app.route('/candle/:prototypeNo/interval/:interval/currency/:currency/trade/:tradeUUID')
    .get(controller.getCandlesForTrade)
}