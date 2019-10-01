const controller = require('./controller.js');

module.exports = (app) => {
  app.route('/algo/:algo_id/currency/:currency')
    .get(controller.getProtoCurrencyTrades);
  app.route('/proto/:proto_no/trades').get(controller.getTradesProto);
  app.route('/protos/:protoNo/intervals/:interval/trades')
    .get(controller.getProtoIntervalTrades);
  app.route('/protos/:protoNo/intervals/:interval/currency/:currency/trades')
    .get(controller.getProtoIntervalCurrencyTrades);
  app.route('/proto/:proto_no/currency/:currency')
     .get(controller.getProtoCurrencyClosedTrades);
  app.route('/proto/:protoNo/currency/:currency/trade/:tradeId')
    .get(controller.getTrade);
  app.route('/protos/:protoNo/intervals/:interval/currencies/:currency/trades/:tradeId')
    .get(controller.getTradeV2);
  app.route('/next-trade/:tradeId').get(controller.getNextTrade);
  app.route('/prev-trade/:tradeId').get(controller.getPrevTrade);
  app.route('/trade/:tradeId/viewed').get(controller.updateTradeToViewed);
  app.route('/proto/:protoNo/interval/:interval/currency/:currency/last-trade')
    .get(controller.getLastProtoIntervalCurrencyTrade);
  app.route('/oanda-trade-transactions/:id').get(controller.getOandaTradeTransactions);
}
