const { alwaysTrueTest } = require('@/simulateTradeHistory/service/conditions');

class setting {
  constructor() {
    this.conditions = {
      open: alwaysTrueTest,
      close: alwaysTrueTest,
    }
  }
}

const masterAlgo = {
  currencySettings: [
    { symbol: 'GBPUSD', settings: new setting() }
  ],

  no: 9999
}

module.exports = masterAlgo