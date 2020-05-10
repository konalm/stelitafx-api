const algorithms = require('@/services/stochasticAlgorithms')


class setting {
  constructor(openTrigger, closeTrigger, stopLoss, algo) {
    this.algo = algo
    this.stopLoss = stopLoss

    const conditions = this.getConditionsWhereAlgo(algo)
    this.conditions = {
      open: conditions.open(openTrigger),
      close: conditions.close(closeTrigger)
    }
  }
  
  getConditionsWhereAlgo(algo) { 
    return algorithms.find((x) => x.algo === algo)
  }
}


const masterAlgo = {
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