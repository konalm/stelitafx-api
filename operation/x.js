require('module-alias/register');

const fs = require('fs');
const sortByService = require('@/simulateTradeHistory/service/sortStatsBy')
const filterService = require('@/simulateTradeHistory/service/filterStatsBy')

const abbrev = 'GBPUSD';
const ops = [
  'stochasticAdx',
  'wmaCrossedOverStochastic'
]
const op = ops[1]

const sortBy = 'best';
const filters = {
  minTrades: 100,
  pipsPerTrade: null,
  winPer: null,
  worstWinPer: null,
  worstPipsPerTrade: null
};

(async () => {
  let stats 
  try {
    stats = JSON.parse(await fs.readFileSync(`../cache/stats/${op}/${abbrev}.JSON`, 'UTF8'));
  } catch (e) {
    console.log(e)
    return console.error(e)
  }

  const sortedStats = sortByService(stats, sortBy)
  const filteredStats = filterService(sortedStats, filters)

  console.log(filteredStats.splice(0, 10).reverse())
})();