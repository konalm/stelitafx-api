require('module-alias/register');

const fs = require('fs');
const sortByService = require('@/simulateTradeHistory/service/sortStatsBy')
const filterService = require('@/simulateTradeHistory/service/filterStatsBy')

const gran = 'M15';
const abbrev = 'GBPUSD';
const ops = [
  'stochasticAdx',
  'wma',
  'stochasticAdxThreshold',
  'stochastic'
]
const op = ops[3]

const sortBy = 'pipsPerTrade';
const dir = 'desc';
const filters = {
  // minTrades: 250,
  pipsPerTrade: null,
  winPer: null,
  worstWinPer: null,
  worstPipsPerTrade: null,
  // tradesPerDay: 1.0,
  // stopLoss: 100
  // threshold: 50
  // adxAlgo: 'adxAboveThreshold'
};

const performance = 35;

(async () => {
  let stats 
  try {
    stats = JSON.parse(
      await fs.readFileSync(`../cache/stats/${op}/${gran}/${abbrev}.JSON`, 'UTF8')
    );
  } catch (e) {
    console.log(e)
    return console.error(e)
  }

  let filteredStats = filterService(stats, filters)
  // filteredStats = filteredStats.filter((x) => x.performance >= performance)

  const sortedStats = sortByService(filteredStats, sortBy, dir)

  console.log(sortedStats.splice(0, 25).reverse())
})();