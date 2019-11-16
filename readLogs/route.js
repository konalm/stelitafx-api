const controller = require('./controller');

module.exports = (app) => {
  app.route('/read-log/:type').get(controller.readLog);
  app.route('/read-oanda-activity-log').get(controller.readOandaActivityLog);
}