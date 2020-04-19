const { stochasticCrossedOver, stochasticCrossedUnder } = require('@/simulateTradeHistory/service/conditions');

module.exports = [
  {
    open: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
    close: trigger  => (p, c) => stochasticCrossedUnder(p, c, trigger),
    algo: 'overUnder'
  },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedOver(p, c, trigger),
    close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    algo: 'overOver'
  },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedUnder(p, c, trigger),
    close: (trigger) => (p, c) => stochasticCrossedOver(p, c, trigger),
    algo: 'underOver'
  },
  {
    open: (trigger) => (p, c) =>  stochasticCrossedUnder(p, c, trigger),
    close: (trigger) => (p, c) => stochasticCrossedUnder(p, c, trigger),
    algo: 'underUnder'
  }
];
