const { 
  stochasticCrossedOver, stochasticCrossedUnder, rateAboveWma
} = require('@/simulateTradeHistory/service/conditions');

class setting {
  constructor (openConditions, closeConditions, openTrigger, closeTrigger, takeProfit, stopLoss) {
    this.stopLoss = stopLoss 
    this.takeProfit = takeProfit

    this.conditions = {
      open: openConditions(openTrigger),
      close: closeConditions(closeTrigger)
    }
  }
}

const masterAlgo = {
  currencySettings: [
    { 
      symbol: 'GBPUSD', 
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        75,
        60,
        null,
        null
      ) 
    },
    {
      symbol: 'EURUSD',
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        75,
        55,
        null,
        null
      )   
    },
    {
      symbol: 'AUDUSD',
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        85,
        70,
        null,
        50
      )   
    },
    {
      symbol: 'USDJPY',
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        75,
        35,
        null,
        30
      )   
    },
    {
      symbol: 'EURGBP',
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        75,
        70,
        null,
        null
      )   
    },
    {
      symbol: 'CHFJPY',
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        85,
        45,
        null,
        15
      )   
    },
    {
      symbol: 'EURCHF',
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        45,
        50,
        40,
        null
      )   
    },
    {
      symbol: 'GBPCAD',
      settings: new setting(
        (openTrigger) => (p, c) => rateAboveWma(c.higherPeriods.H1, 15) 
          && rateAboveWma(c.higherPeriods.H2, 15) 
          && rateAboveWma(c.higherPeriods.H4, 15) 
          && rateAboveWma(c.higherPeriods.H6, 15)
          && rateAboveWma(c.higherPeriods.H12, 15)
          && stochasticCrossedOver(p, c, openTrigger), 
        (closeTrigger) => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
        90,
        80,
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

  transactionType: 'long',
  no: 8529,
}

module.exports = masterAlgo