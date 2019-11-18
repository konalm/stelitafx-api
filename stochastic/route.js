const controller = require('./controller')

module.exports = (app) => {
  app.route('/abbrev/:abbrev/interval/:interval/stochastic')
     .get(controller.getStochastics)
  app.route('/stochastics/:currency/trade/:tradeId').get(controller.getStochasticForTrade);
}