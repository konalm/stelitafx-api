const controller = require('./controller')

module.exports = (app) => {
  app.route('/published-algorithms').get(controller.getPublishedAlgorithms)
}

