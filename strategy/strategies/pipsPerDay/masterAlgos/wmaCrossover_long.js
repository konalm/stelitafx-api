const { wmaCrossedOver, wmaUnder } = require('@/simulateTradeHistory/service/conditions');

class setting {
  constructor(shortWma, longWma, stopLoss) {
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
    { symbol: 'GBPUSD', settings: new setting(110, 130, 50) },
    { symbol: 'EURUSD', settings: new setting(40, 160, 1) },
    { symbol: 'AUDUSD', settings: new setting(165, 185, 15) },
    { symbol: 'USDJPY', settings: new setting(105, 110, 5) },
    { symbol: 'EURGBP', settings: new setting(135, 140, 1) },
    { symbol: 'CHFJPY', settings: new setting(175, 200, 1) },
    { symbol: 'EURCHF', settings: new setting(180, 195, 1) },
    { symbol: 'GBPCAD', settings: new setting(35, 170, 15) },
  ],

  transactionType: 'long',

  no: 2889
}

module.exports = masterAlgo