const controller = require('./controller');

module.exports = (app) => {
  app.route('/protos').get(controller.getProtos);
  app.route('/protos/:protoNo').get(controller.getProto);
  app.route('/protos/:protoNo/algo-data/:currency')
    .get(controller.getProtoAlgoCurrencyData);
}
