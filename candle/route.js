const controller = require('./controller')


module.exports = (app) => {
  app.route('/candle/:interval/currency/:currency/count/:count').get(controller.getCandles)

  app.route('/candle/:prototypeNo/interval/:interval/currency/:currency/trade/:tradeUUID')
    .get(controller.getCandlesForTrade)

  app.route('/heikien-ashi-candles/:symbol/intervals/:interval')
    .get(controller.getHeikenAshiCandles)

  app.route('/waves/:symbol/intervals/:interval').get(controller.getWaves)

  app.route('/scan-impulse-waves/:symbol/intervals/:interval').get(controller.scanImpulseWaves)
}