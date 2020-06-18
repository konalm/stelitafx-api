const controller = require('./controller')


module.exports = (app) => {
  app.route('/candles/:symbol/grans/:gran').get(controller.getCandles)

  app.route('/candle/:prototypeNo/interval/:interval/currency/:currency/trade/:tradeUUID')
    .get(controller.getCandlesForTrade)

  app.route('/heikien-ashi-candles/:symbol/intervals/:gran')
    .get(controller.getHeikenAshiCandles)

  app.route('/waves/:symbol/grans/:gran').get(controller.getWaves)

  app.route('/scan-impulse-waves/:symbol/intervals/:interval').get(controller.scanImpulseWaves)

  app.route('/scan-harmonic-patterns/:symbol/grans/:gran').get(controller.scanHarmonicPatterns);

  app.route('/volume/:symbol/grans/:gran').get(controller.getVolume);

  app.route('/trends/:symbol/grans/:gran').get(controller.getTrends);
}