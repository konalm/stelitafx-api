const controller = require('./controller.js');

module.exports = (app) => {
  app.route('/algo/:algo_id/currency/:currency')
    .get(controller.getProtoCurrencyTrades);

  app.route('/proto/:proto_no/trades').get(controller.getProtoTrades);
}
