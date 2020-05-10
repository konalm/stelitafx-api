const { 
  stochasticCrossedOver, stochasticCrossedUnder, rateAboveWma, 
} = require('@/simulateTradeHistory/service/conditions');

module.exports = [
  {
    open: wma => openTrigger => (p, c) => rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, openTrigger),
  
    close: closeTrigger => (p, c) => stochasticCrossedUnder(p, c, closeTrigger),

    algo: 'overUnder'
  },
  {
    open: wma => openTrigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, openTrigger),

    close: closeTrigger => (p, c) => stochasticCrossedOver(p, c, closeTrigger),

    algo: 'overOver'
  },
  {
    open: wma => openTrigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, openTrigger),

    close: closeTrigger => (p, c) => stochasticCrossedOver(p, c, closeTrigger),

    algo: 'underOver'
  },
  {
    open: wma => openTrigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, openTrigger),

    close: closeTrigger => (p, c) => stochasticCrossedUnder(p, c, closeTrigger),

    algo: 'underUnder'
  }
]