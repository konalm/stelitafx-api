require('module-alias/register');

const fs = require('fs');
const simulateTrades = require('../service/simulateTrades');
const { tradesTotalPips } = require('@/simulateTradeHistory/service');
const { daysBetweenDates } = require('@/services/utils');
const calcMacdInBatch = require('@/indicators/macd/service/calcMacdInBatch')
const {
  macdCrossedOver, 
  macdUnder, 
  macdBelowThreshold, 
  macdHistogramAboveThreshold, 
  macdAbove, 
  rateAboveWma
} = require('@/simulateTradeHistory/service/conditions')
const getPerformance = require('../service/getPerformance')


const gran = 'M15';
const abbrev = 'GBPUSD';
const sinceDate = '2020-01-01T00:00:00.000Z';

const upperPeriodWma = 15

const algorithm = {
  open: (p, c) => macdCrossedOver(p, c)
    && rateAboveWma(c.upperPeriods.H2, upperPeriodWma)
    && rateAboveWma(c.upperPeriods.H4, upperPeriodWma)
    && rateAboveWma(c.upperPeriods.H6, upperPeriodWma)
    && rateAboveWma(c.upperPeriods.H12, upperPeriodWma),

  close: (p, c) => macdUnder(p, c)
};

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
  console.log('MACD brute force')

  const periods = await getPeriods(gran, false)

  console.log(`periods ... ${periods.length}`)


  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())
 
  getAlgoPerformance(periods, daysOfPeriods, abbrev)
})();


const getAlgoPerformance = (periods, daysOfPeriods, abbrev) => {
  console.log('get algo performance')

  const performances = []

  // let stopLoss = null 
  // let takeProfit = null 

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
      performances.push(performance)
    }
  } 

  const worst = [...performances]
    .sort((a, b) => a.pipsPerTrade - b.pipsPerTrade)
    .splice(0, 20)
    .reverse()
  
  const best = [...performances]
  .sort((a, b) => b.pipsPerTrade - a.pipsPerTrade)
  .splice(0, 20)
  .reverse()

  console.log('best >>>>')
  console.log(best)

  // console.log('worst >>>>')
  // console.log(worst)

  // console.log('no stops >>>')
  // console.log([...performances].filter((x) => x.stopLoss === null && x.stopGain === null))
}
