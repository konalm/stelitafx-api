const algorithms = require('@/services/stochasticAlgorithms')
const { wmaCrossedOver, wmaUnder } = require('@/simulateTradeHistory/service/conditions');


class setting {
  constructor(openTrigger, closeTrigger, stopLoss, algo) {
    this.openTrigger = openTrigger 
    this.closeTrigger = closeTrigger
    this.algo = algo
    this.stopLoss = stopLoss
    this.conditions = this.getConditionsWhereAlgo(algo)
  }
  
  getConditionsWhereAlgo(algo) { 
    return algorithms.find((x) => x.algo === algo)
  }
}


const masterAlgo = {
  conditions: {
    open: (params) => (p, c) => wmaCrossedOver(p, c, params.shortWma, params.longWma),
    close: (params) => (p, c) => wmaUnder(p, c, params.shortWma, params.longWma)
  },

  currencySettings:  [
    { symbol: 'GBPUSD', settings: new setting(95, 100, null, 'overOver') },
    { symbol: 'EURUSD', settings: new setting(45, 65, 30, 'underOver') },
    { symbol: 'AUDUSD', settings: new setting(75, 95, 30, 'overOver') },
    { symbol: 'USDJPY', settings: new setting(65, 100, 15, 'underOver') },
    { symbol: 'EURGBP', settings: new setting(35, 35, null, 'underOver') },
    { symbol: 'CHFJPY', settings: new setting(45, 50, null, 'underOver') },
    { symbol: 'EURCHF', settings: new setting(35, 35, null, 'underOver') },
    { symbol: 'GBPCAD', settings: new setting(35, 30, 15, 'underOver') },
  ],

  transactionType: 'long',

  no: 5440
}

module.exports = masterAlgo