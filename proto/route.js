const controller = require('./controller');

module.exports = (app) => {
  app.route('/protos').get(controller.getProtos);
  app.route('/protos/:protoNo').get(controller.getProto);
  app.route('/protos/:protoNo/interval/:interval/algo-data/:currency')
    .get(controller.getProtoIntervalCurrencyData);
  app.route('/algorithm/:id/intervals/:interval/stats').get(controller.getAlgorithmStats)
}
