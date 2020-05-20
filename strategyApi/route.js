const controller = require('./controller')

module.exports = (app) => {
  app.route('/strategies').get(controller.getStrategies)
  app.route('/strategies/:uuid').get(controller.getStrategy)
  app.route('/strategies/:strategyUUID/master-algos/:masterAlgoUUID')
    .get(controller.getStrategyMasterAlgo)
}