const controller = require('./controller.js');

module.exports = (app) => {
  app.route('/algo/:algo_id/currency/:currency')
    .get(controller.getProtoCurrencyTrades);

  app.route('/proto/:proto_no/trades').get(controller.getTradesProto);
  app.route('/proto/:proto_no/currency/:currency')
     .get(controller.getProtoCurrencyClosedTrades);

  app.route('/proto/:protoNo/currency/:currency/trade/:tradeId')
    .get(controller.getTrade);

  app.route('/next-trade/:tradeId').get(controller.getNextTrade);
  app.route('/prev-trade/:tradeId').get(controller.getPrevTrade);
  app.route('/trade/:tradeId/viewed').get(controller.updateTradeToViewed);
}
