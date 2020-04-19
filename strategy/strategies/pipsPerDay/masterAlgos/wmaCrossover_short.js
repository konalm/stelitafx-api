const { wmaCrossedOver, wmaUnder } = require('@/simulateTradeHistory/service/conditions');

class setting {
  constructor(shortWma, longWma, stopLoss) {
    this.shortWma = shortWma 
    this.longWma = longWma
    this.stopLoss = stopLoss
    this.conditions = {
      open: (params) => (p, c) => wmaCrossedOver(p, c, params.shortWma, params.longWma),
      close: (params) => (p, c) => wmaUnder(p, c, params.shortWma, params.longWma)
    }
  }
}

const masterAlgo = {
  // conditions: {
  //   open: (params) => (p, c) => wmaCrossedOver(p, c, params.shortWma, params.longWma),
  //   close: (params) => (p, c) => wmaUnder(p, c, params.shortWma, params.longWma)
  // },

  currencySettings:  [
    { symbol: 'GBPUSD', settings: new setting(5, 25, 15) },
    { symbol: 'EURUSD', settings: new setting(185, 200, 15) },
    { symbol: 'AUDUSD', settings: new setting(5, 60, 5) },
    { symbol: 'USDJPY', settings: new setting(5, 200, 5) },
    { symbol: 'EURGBP', settings: new setting(5, 10, 1) },
    { symbol: 'CHFJPY', settings: new setting(5, 60, 30) },
    { symbol: 'EURCHF', settings: new setting(5, 70, null) },
    { symbol: 'GBPCAD', settings: new setting(5, 10, 5) },
  ],

  transactionType: 'short',

  no: 7954
}

module.exports = masterAlgo