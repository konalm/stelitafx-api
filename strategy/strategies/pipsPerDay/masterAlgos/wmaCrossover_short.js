const { wmaCrossedOver, wmaUnder } = require('@/simulateTradeHistory/service/conditions');

class setting {
  constructor(shortWma, longWma, stopLoss) {
    // this.shortWma = shortWma 
    // this.longWma = longWma
    // this.stopLoss = stopLoss
    // this.conditions = {
    //   open: (params) => (p, c) => wmaCrossedOver(p, c, params.shortWma, params.longWma),
    //   close: (params) => (p, c) => wmaUnder(p, c, params.shortWma, params.longWma)
    // }

    this.stopLoss = stopLoss

    const algo = {
      open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma),
      close: (shortWma, longWma) => (p, c) => wmaUnder(p, c, shortWma, longWma)
    }
    this.conditions = {
      open: algo.open(shortWma, longWma),
      close: algo.close(shortWma, longWma)
    }
  }
}

const masterAlgo = {
  currencySettings:  [
    { symbol: 'GBPUSD', settings: new setting(10, 30, 5) },
    { symbol: 'EURUSD', settings: new setting(10, 25, 5) },
    { symbol: 'AUDUSD', settings: new setting(5, 15, 1) },
    { symbol: 'USDJPY', settings: new setting(10, 35, 1) },
    { symbol: 'EURGBP', settings: new setting(5, 10, 1) },
    { symbol: 'CHFJPY', settings: new setting(5, 60, 30) },
    { symbol: 'EURCHF', settings: new setting(5, 70, null) },
    { symbol: 'GBPCAD', settings: new setting(5, 10, 5) },
  ],

  transactionType: 'short',

  no: 7954
}

module.exports = masterAlgo