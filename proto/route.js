const controller = require('./controller');

module.exports = (app) => {
  app.route('/protos').get(controller.getProtos);
  app.route('/protos/:id').get(controller.getProto);
}
