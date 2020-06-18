require('module-alias/register');

const fs = require('fs');
const sortByService = require('@/simulateTradeHistory/service/sortStatsBy')
const filterService = require('@/simulateTradeHistory/service/filterStatsBy')

const gran = 'M5';
const abbrev = 'GBPUSD';
const ops = [
  'stochasticAdx',
  'wma',
  'stochasticAdxThreshold',
  'stochastic',
  'rateClosedWma',
  'engulfed',
  'lawOfAverage',
  'volume'

]
const op = ops[7]

const sortBy = 'performance';
const dir = 'desc';
const filters = {
  // minTrades: 250,
  pipsPerTrade: null,
  winPer: null,
  worstWinPer: null,
  worstPipsPerTrade: null,
  // tradesPerDay: 2,
  // fastWma: 5,
  // slowWma: 15
  // stopLoss: 100
  // threshold: 50
  // adxAlgo: 'adxAboveThreshold'
};

 
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