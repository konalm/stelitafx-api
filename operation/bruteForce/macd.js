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

const gran = 'M15';
const abbrev = 'GBPCAD';
const sinceDate = '2019-01-01T00:00:00.000Z';

const upperPeriodWma = 15

const algorithms = [
  {
    open: (p, c) => macdCrossedUnder(p, c)
      && rateBelowWma(c.upperPeriods.H1, upperPeriodWma),

    close: (p, c) => macdAbove(p, c),
    algo: 'H1'
  },
  // {
  //   open: (p, c) => macdCrossedUnder(p, c)
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma),

  //   close: (p, c) => macdAbove(p, c),
  //   algo: 'H2'
  // },
  // {
  //   open: (p, c) => macdCrossedUnder(p, c)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma),

  //   close: (p, c) => macdAbove(p, c),
  //   algo: 'H4'
  // },
  {
    open: (p, c) => macdCrossedUnder(p, c)
      && rateBelowWma(c.upperPeriods.H6, upperPeriodWma),
    close: (p, c) => macdAbove(p, c),
    algo: 'H6'
  },
  {
    open: (p, c) => macdCrossedUnder(p, c)
      && rateBelowWma(c.upperPeriods.H1, upperPeriodWma)
      && rateBelowWma(c.upperPeriods.H2, upperPeriodWma)
      && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
      && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
      && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

    close: (p, c) => macdAbove(p, c),

    algo: 'H1-H12'
  },
  // {
  //   open: (p, c) => macdCrossedUnder(p, c)
  //     && rateBelowWma(c.upperPeriods.H2, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H4, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H6, upperPeriodWma)
  //     && rateBelowWma(c.upperPeriods.H12, upperPeriodWma),

  //   close: (p, c) => macdAbove(p, c),

  //   algo: 'H2-H12'
  // }
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

  console.log(periods[0].date)
  console.log(periods[0].upperPeriods.H1.date)

  console.log('last period -->')
  console.log(periods[periods.length - 1].date)
  console.log(periods[periods.length - 1].upperPeriods.H1.date)

  return 

  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const performances = []
  algorithms.forEach((x) => {
    performances.push(...getAlgoPerformance(x, periods, daysOfPeriods, abbrev))
  })

  const worst = [...performances]
  .sort((a, b) => a.pipsPerTrade - b.pipsPerTrade)
  .splice(0, 20)
  .reverse()

  const best = [...performances]
    .sort((a, b) => b.pipsPerTrade - a.pipsPerTrade)
    .splice(0, 20)
    .reverse()

  console.log(worst)
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
