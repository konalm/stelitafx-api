require('module-alias/register');

const fs = require('fs');
const simulateTrades = require('../service/simulateTrades');
const { tradesTotalPips } = require('@/simulateTradeHistory/service');
const { daysBetweenDates } = require('@/services/utils');
const calcMacdInBatch = require('@/indicators/macd/service/calcMacdInBatch')
const {
  macdCrossedOver, 
  macdCrossedUnder,
  macdUnder, 
  macdAbove,
  macdBelowThreshold, 
  macdHistogramAboveThreshold, 
  rateAboveWma,
  rateBelowWma
} = require('@/simulateTradeHistory/service/conditions')
const getPerformance = require('../service/getPerformance')
// const calcMacdInBatch = require('@/indicators/macd/service')

const gran = 'M5';
const abbrev = 'GBPUSD';
const sinceDate = '2018-01-01T00:00:00.000Z';

const upperPeriodWma = 15

const algorithms = [
  {
    open: (p, c) => macdCrossedOver(p, c),
    close: (p, c) => macdUnder(p, c),
    algo: 'default'
  },
  // {
  //   open: (p, c) => macdCrossedUnder(p, c)
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma),

  //   close: (p, c) => macdAbove(p, c),
  //   algo: 'H2'
  // },
]

const getPeriods = async (gran, map) => {
  const filePath = `../../cache/calculatedPeriods/withRelatedUpper/${gran}/${abbrev}.JSON`
  const allPeriods = JSON.parse( await fs.readFileSync(filePath, 'utf8'))

   periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))

   if (!map) return periods

  return periods.map((x) => ({
    ...x,
    date: x.date,
    rate: x.exchange_rate,
    exchange_rate: x.exchange_rate
  }))
}

(async () => {
  const periods = await getPeriods(gran, false)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  console.log(`periods .. ${periods.length}`)

  periods.forEach((period, i) => {
    console.log(`i ... ${i}`)
    period.macd = calcMacdInBatch(periods) 
  })

  const performances = []
  algorithms.forEach((x) => {
    performances.push(...getAlgoPerformance(x, periods, daysOfPeriods, abbrev))
  })

  const worst = [...performances]
  .sort((a, b) => a.pipsPerTrade - b.pipsPerTrade)
  .splice(0, 5)
  .reverse()

  const best = [...performances]
    .sort((a, b) => b.pipsPerTrade - a.pipsPerTrade)
    .splice(0, 5)
    .reverse()

  console.log('worst -->')
  console.log(worst)

  console.log('best -->')
  console.log(best)
})();


const getAlgoPerformance = (algorithm, periods, daysOfPeriods, abbrev) => {
  console.log('get algo performance')

  const performances = []

  /* loop stop loss */ 
  for (let stopLoss = 0; stopLoss <= 100; stopLoss += 5) {

    /* loop take profit */
    for (let takeProfit = 0; takeProfit <= 100; takeProfit += 5) {
      stopLoss = stopLoss === 0 ? null : stopLoss
      takeProfit = takeProfit === 0 ? null : takeProfit

      const performance = getPerformance(periods)(algorithm)(stopLoss)(takeProfit)
        (daysOfPeriods)
        (abbrev)
        ()
      performance.algo = algorithm.algo
      performances.push(performance)
    }
  } 

  return performances
}
