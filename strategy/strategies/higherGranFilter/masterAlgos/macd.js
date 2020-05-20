const { 
  macdCrossedOver, macdUnder, rateAboveWma 
} = require('@/simulateTradeHistory/service/conditions');

class setting {
  constructor (openConditions, takeProfit, stopLoss) {
    this.takeProfit = takeProfit
    this.stopLoss = stopLoss 

    this.conditions = {
      open: openConditions,
      close: (p, c) => macdUnder(p, c)
    }
  }
}

const masterAlgo = {
  currencySettings: [
    { 
      symbol: 'GBPUSD', 
      settings: new setting(
        (p, c) => macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        null, 
        null
      ) 
    },
    {
      symbol: 'EURUSD',
      settings: new setting(
        (p, c) => macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H1, 15)
          && rateAboveWma(c.higherPeriods.H2, 15)
          && rateAboveWma(c.higherPeriods.H4, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        80, 
        25
      )   
    },
    {
      symbol: 'AUDUSD',
      settings: new setting(
        (p, c) => macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H1, 15)
          && rateAboveWma(c.higherPeriods.H2, 15)
          && rateAboveWma(c.higherPeriods.H4, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        65,
        35
      )
    },
    {
      symbol: 'USDJPY',
      settings: new setting(
        (p, c) => macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H2, 15)
          && rateAboveWma(c.higherPeriods.H4, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        null,
        25
      )
    },
    {
      symbol: 'EURGBP',
      settings: new setting(
        (p, c) =>  macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H1, 15)
          && rateAboveWma(c.higherPeriods.H2, 15)
          && rateAboveWma(c.higherPeriods.H4, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        45,
        null
      )
    },
    {
      symbol: 'CHFJPY',
      settings: new setting(
        (p, c) =>  macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H1, 15)
          && rateAboveWma(c.higherPeriods.H2, 15)
          && rateAboveWma(c.higherPeriods.H4, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        null,
        10
      )
    },
    {
      symbol: 'EURCHF',
      settings: new setting(
        (p, c) => macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H2, 15)
          && rateAboveWma(c.higherPeriods.H4, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        20,
        10
      )
    },
    {
      symbol: 'GBPCAD',
      settings: new setting(
        (p, c) => macdCrossedOver(p, c)
          && rateAboveWma(c.higherPeriods.H2, 15)
          && rateAboveWma(c.higherPeriods.H4, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15),
        80,
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

  transactionType: 'long',
  no: 1830,
}

module.exports = masterAlgo