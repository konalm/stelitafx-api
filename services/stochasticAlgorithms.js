const { 
  stochasticCrossedOver, stochasticCrossedUnder 
} = require('@/simulateTradeHistory/service/conditions');

module.exports = [
  {
    open: openTrigger => (p, c) => stochasticCrossedOver(p, c, openTrigger),
    close: closeTrigger  => (p, c) => stochasticCrossedUnder(p, c, closeTrigger),
    algo: 'overUnder'
  },
  {
    open: openTrigger => (p, c) =>  stochasticCrossedOver(p, c, openTrigger),
    close: closeTrigger => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
    algo: 'overOver'
  },
  {
    open: openTrigger => (p, c) =>  stochasticCrossedUnder(p, c, openTrigger),
    close: closeTrigger => (p, c) => stochasticCrossedOver(p, c, closeTrigger),
    algo: 'underOver'
  },
  {
    open: openTrigger => (p, c) =>  stochasticCrossedUnder(p, c, openTrigger),
    close: closeTrigger => (p, c) => stochasticCrossedUnder(p, c, closeTrigger),
    algo: 'underUnder'
  }
];
