const algorithms = require('@/services/stochasticAlgorithms')


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
  currencySettings:  [
    { symbol: 'GBPUSD', settings: new setting(100, 95, null, 'overOver') },
    { symbol: 'EURUSD', settings: new setting(25, 10, 50, 'overUnder') },
    { symbol: 'AUDUSD', settings: new setting(65, 55, null, 'overOver') },
    { symbol: 'USDJPY', settings: new setting(100, 90, 50, 'overOver') },
    { symbol: 'EURGBP', settings: new setting(40, 30, 5, 'overUnder') },
    { symbol: 'CHFJPY', settings: new setting(55, 10, 5, 'overUnder') },
    { symbol: 'EURCHF', settings: new setting(40, 35, 5, 'overUnder') },
    { symbol: 'GBPCAD', settings: new setting(40, 35, 5, 'overUnder') },
  ],

  transactionType: 'short',

  no: 7786
}

module.exports = masterAlgo