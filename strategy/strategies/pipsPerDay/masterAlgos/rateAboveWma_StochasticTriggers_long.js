const algorithms = require('@/services/rateAboveWmaStochasticAlgorithms')
const { wmaCrossedOver, wmaUnder } = require('@/simulateTradeHistory/service/conditions');


class setting {
  constructor(wma, openTrigger, closeTrigger, stopLoss, algo) {
    this.wma = wma
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
    { symbol: 'GBPUSD', settings: new setting(100, 95, 100, null, 'overOver') },
    { symbol: 'EURUSD', settings: new setting(30, 50, 100, 30, 'underOver') },
    { symbol: 'AUDUSD', settings: new setting(30, 70, 95, null, 'overOver') },
    { symbol: 'USDJPY', settings: new setting(100, 45, 45, null, 'underOver') },
    { symbol: 'EURGBP', settings: new setting(50, 90, 70, null, 'underOver') },
    { symbol: 'CHFJPY', settings: new setting(50, 95, 80, null, 'underOver') },
    { symbol: 'EURCHF', settings: new setting(5, 10, 95, null, 'underOver') },
    { symbol: 'GBPCAD', settings: new setting(30, 75, 85, 50, 'underOver') },
  ],

  transactionType: 'long',

  no: 3121
}

module.exports = masterAlgo