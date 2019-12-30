const controller = require('./controller')

module.exports = (app) => {
  app.route('/abbrev/:abbrev/interval/:interval/stochastic')
     .get(controller.getStochastics)
  app.route('/stochastics/:prototypeNumber/interval/:interval/currency/:currency/trade/:tradeUUID')
    .get(controller.getStochasticForTrade);
}