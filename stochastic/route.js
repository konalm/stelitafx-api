const controller = require('./controller')

module.exports = (app) => {
  app.route('/abbrev/:abbrev/interval/:interval/stochastic')
     .get(controller.getStochastics)
}