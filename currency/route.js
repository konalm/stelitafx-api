const controller = require('./controller.js')

module.exports = (app) => {
  app.route('/major-currencypair-abbrevs').get(controller.getMajorCurrencies);
}
