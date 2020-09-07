const { 
  wmaCrossedOver, wmaCrossedOverV2, wmaUnder, rateBelowWma 
} = require('@/simulateTradeHistory/service/conditions');

class setting {
  constructor (openConditions, shortWma, longWma, takeProfit, stopLoss) {
    const closeConditions = (shortWma, longWma) => (p, c) => wmaUnder(p, c, shortWma, longWma)

    this.stopLoss = stopLoss 
    this.takeProfit = takeProfit

    this.conditions = {
      open: openConditions(shortWma, longWma),
      close: closeConditions(shortWma, longWma)
    }
  }
}

const masterAlgo = {
  currencySettings: [
    { 
      symbol: 'GBPUSD', 
      settings: new setting(
        (shortWma, longWma) => (p, c) => rateBelowWma(c.higherPeriods.H1, 15) 
          && rateBelowWma(c.higherPeriods.H2, 15) 
          && rateBelowWma(c.higherPeriods.H4, 15) 
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H12, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        5, 
        15, 
        20, 
        null
      ) 
    },
    {
      symbol: 'EURUSD',
      settings: new setting(
        (shortWma, longWma) => (p, c) => 
          rateBelowWma(c.higherPeriods.H2, 15)
          && rateBelowWma(c.higherPeriods.H4, 15)
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H12, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        5, 
        15, 
        30, 
        45
      )   
    },
    {
      symbol: 'AUDUSD',
      settings: new setting(
        (shortWma, longWma) => (p, c) => 
          rateBelowWma(c.higherPeriods.H2, 15)
          && rateBelowWma(c.higherPeriods.H4, 15)
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H12, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        5, 
        15, 
        35, 
        45
      )
    },
    {
      symbol: 'USDJPY',
      settings: new setting(
        (shortWma, longWma) => (p, c) => 
          rateBelowWma(c.higherPeriods.H2, 15)
          && rateBelowWma(c.higherPeriods.H4, 15)
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H12, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        5, 
        15, 
        35, 
        45
      )
    },
    {
      symbol: 'EURGBP',
      settings: new setting(
        (shortWma, longWma) => (p, c) => 
          rateBelowWma(c.higherPeriods.H2, 15)
          && rateBelowWma(c.higherPeriods.H4, 15)
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H12, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        5, 
        15, 
        20, 
        null
      )
    },
    {
      symbol: 'CHFJPY',
      settings: new setting(
        (shortWma, longWma) => (p, c) => 
          rateBelowWma(c.higherPeriods.H6, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        10, 
        30, 
        null, 
        30
      )
    },
    {
      symbol: 'EURCHF',
      settings: new setting(
        (shortWma, longWma) => (p, c) => 
          rateBelowWma(c.higherPeriods.H2, 15)
          && rateBelowWma(c.higherPeriods.H4, 15)
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H12, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        5, 
        20, 
        null, 
        null
      )
    },
    {
      symbol: 'GBPCAD',
      settings: new setting(
        (shortWma, longWma) => (p, c) => 
          rateBelowWma(c.higherPeriods.H2, 15)
          && rateBelowWma(c.higherPeriods.H4, 15)
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H6, 15)
          && rateBelowWma(c.higherPeriods.H12, 15)
          && wmaCrossedOverV2(p, c, shortWma, longWma), 
        5, 
        15, 
        null, 
        null
      )
    },
    // {
    //   symbol: 'ETHBTC',
    //   settings: new setting(
    //     (shortWma, longWma) => (p, c) =>
    //       wmaCrossedOverV2(p, c, shortWma, longWma),
    //     1,
    //     2,
    //     100,
    //     100
    //   )
    // }
  ],

  transactionType: 'short',
  no: 4025,
}

module.exports = masterAlgo