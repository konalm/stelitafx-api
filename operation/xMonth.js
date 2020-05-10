require('module-alias/register');

const fs = require('fs');
const sortByService = require('@/simulateTradeHistory/service/sortStatsBy')
const filterService = require('@/simulateTradeHistory/service/filterStatsBy')

const gran = 'M15';
const ops = [
  'stochasticAdx',
  'wmaStoch',
  'stochasticAdxThreshold',
  'wma',
  'stochastic',
  'rateAboveWmaStochastic'
]
const abbrev = 'GBPUSD';
const op = ops[3];
const MONTH_INDEX = 0;
const type = 'long';
const DIR = `../cache/stats/${op}/${gran}/${abbrev}`;

const MONTH_TO_MONTH = false
const monthToMonthSettings = {
  // stoch: {
  //   buyTrigger: 90,
  //   sellTrigger: 10,
  // },
  // wmas: {
  //   short: 5,
  //   long: 100
  // },
  openTrigger: 95,
  closeTrigger: 100,
  stopLoss: 0, 
  stopGain: null,
  algo: 'overOver',
}

const sortBy = 'pipsPerTrade';
const dir = 'desc';
const filters = {
  // minTrades: 100,
  // pipsPerTrade: null,
  // winPer: null,
  // worstWinPer: null,
  // worstPipsPerTrade: null,
  // tradesPerDay: 1.0,
  // month: 'all'
  // stopGain: null,
  // openTrigger: 95,
  // sellTrigger: 100,
  // stopLoss: 0,
  // pipsPerTrade: 6
  // threshold: 50
    // algo: 'overOver'
};

const getWmaStochStats = async () => {
  let statFiles
  try {
    statFiles = await fs.readdirSync(DIR)
  } catch (e) {
    return console.error(e)
  }

  const algoStats = []
  for (let i=0; i<statFiles.length; i++) {
    algoStats.push( JSON.parse( await fs.readFileSync(`${DIR}/${statFiles[i]}`)) );
  }

  return algoStats.flat();
}


(async () => {
  let stats 
  if (op === 'wmaStoch') stats = await getWmaStochStats()
  else stats = await JSON.parse(fs.readFileSync(`${DIR}.JSON`))

  if (MONTH_TO_MONTH) {
    const monthToMonthPerformance = getMonthToMonthPerformance(stats, monthToMonthSettings)
    console.log(monthToMonthPerformance)
    return
  }

  const filteredStats = filterService(stats, filters)

  const month = 'all';
  const monthStats = filteredStats.filter((x) => x.month === month)
  const sortedStats = sortByService(monthStats, sortBy, dir)
  const months = abstractMonths(stats)


  months.forEach((month) => {
    const statsForMonth = filteredStats.filter((x) => x.month === month)
    const sortedStats = sortByService(statsForMonth, sortBy, dir)
  })

  console.log(sortedStats.splice(0, 5).reverse())
})();


const getMonthToMonthPerformance = (stats, settings) => {
  const performances = stats.filter((x) =>  
    x.buyTrigger === settings.stoch.buyTrigger
      && x.sellTrigger === settings.stoch.sellTrigger
      && x.wmas.short === settings.wmas.short 
      && x.wmas.long === settings.wmas.long
      && x.stochAlgo === settings.algo
      && x.stopLoss === settings.stopLoss
      && x.stopGain === settings.stopGain
      && x.month !== 'all'
  )

  return performances.sort((a, b) => new Date(a.month) - new Date(b.month))
}

const getWMAMonthToMonthPerformance = (stats, settings) => {
  console.log(settings)
  return stats.filter((x) => 
    x.fastWma === settings.fastWma 
      && x.slowWma === settings.slowWma 
      && x.stopLoss === settings.stopLoss 
      && x.stopGain === settings.stopGain
      && x.algo === settings.algo
  )
}

const getStochMonthToMonthPerformance = (stats, settings) => {
  return stats.filter((x) =>
    x.openTrigger === settings.openTrigger
      && x.closeTrigger === settings.closeTrigger 
      && x.stopLoss === settings.stopLoss 
      && x.stopGain === settings.stopGain
      && x.algo === settings.algo
  )
}


const abstractMonths = (stats) => [...new Set(stats.map((x) => x.month))]
