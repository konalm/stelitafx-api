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
    { symbol: 'GBPUSD', settings: new setting(15, 30, 45, 15, 'overOver') },
    { symbol: 'EURUSD', settings: new setting(15, 85, 85, null, 'overUnder') },
    { symbol: 'AUDUSD', settings: new setting(100, 70, 55, null, 'overOver') },
    { symbol: 'USDJPY', settings: new setting(15, 20, 90, 50, 'overOver') },
    { symbol: 'EURGBP', settings: new setting(15, 30, 25, 5, 'overUnder') },
    { symbol: 'CHFJPY', settings: new setting(50, 65, 10, 5, 'overUnder') },
    { symbol: 'EURCHF', settings: new setting(15, 40, 35, 5, 'overUnder') },
    { symbol: 'GBPCAD', settings: new setting(5, 40, 35, 5, 'overUnder') },
  ],

  transactionType: 'short',

  no: 3574
}

module.exports = masterAlgo