const controller = require('./controller')


module.exports = (app) => {
  app.route('/adx/:interval/currency/:currency/count/:count').get(controller.getAdx)
  app.route('/adx/:prototypeNo/interval/:interval/currency/:currency/trade/:tradeUUID')
    .get(controller.getAdxItemsForTrade)
}