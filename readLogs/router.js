const controller = require('./controller.js');

module.exports = (app) => {
  app.route('/read-log/:type').get(controller.readLog);
}