const controller = require('./controller')

module.exports = (app) => {
  app.route('/candle/:interval/currency/:currency/count/:count').get(controller.getCandles)
}