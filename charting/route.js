const controller = require('./controller')

module.exports = (app) => {
  app.route('/charting-wma-options').post(controller.createChartingWMAOption)
  app.route('/charting-wma-options/:uuid').put(controller.updateChartingWMAOptions)
  app.route('/charting-wma-options').get(controller.getChartingWMAOptions)
  app.route('/charting-wma-options/:uuid').get(controller.getChartingWMAOptionsItem)
}

