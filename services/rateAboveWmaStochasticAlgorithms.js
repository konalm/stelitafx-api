const { 
  stochasticCrossedOver, stochasticCrossedUnder, rateAboveWma, 
} = require('@/simulateTradeHistory/service/conditions');

module.exports = [
  {
    open: wma => trigger => (p, c) => rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    algo: 'overUnder'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),

    algo: 'overOver'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),

    algo: 'underOver'
  },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    algo: 'underUnder'
  }
]