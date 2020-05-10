require('module-alias/register');

const fs = require('fs')
const JSONStream = require('JSONStream');
const { 
  rateAboveWma, stochasticCrossedOver, stochasticCrossedUnder 
} = require('@/simulateTradeHistory/service/conditions');

const stopLosses = [null, 1, 5, 15, 30, 50];
// const stopLosses = [null, 15, 30];
const wmas = [25, 50, 100, 200];
// const wmas = [50];
const interval = 5;
const abbrev = 'GBPCAD'

const { daysBetweenDates, percentage } = require('@/services/utils');
const getPerformance = require('../service/getPerformance')
const getMonthPerformances = require('@/operation/service/getMonthPerformances');
const getMonthsSinceDate = require('@/operation/service/getMonthsSinceDate')
const sinceDate = '2019-01-01T00:00:00.000Z';

// ./../cache/stats/rateAboveWmaStochastic/${interval}/${abbrev}.JSON
const PATH  = `../../cache/stats/rateAboveWmaStochastic/${interval}/${abbrev}.JSON`;
const stream = fs.createWriteStream(PATH)
const jsonwriter = JSONStream.stringify()
jsonwriter.pipe(stream);


const algorithms = [
  // {
  //   open: wma => trigger => (p, c) => rateAboveWma(c, wma) 
  //     && stochasticCrossedOver(p, c, trigger),

  //   close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

  //   algo: 'overUnder'
  // },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),

    algo: 'overOver'
  },
  // {
  //   open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
  //     && stochasticCrossedUnder(p, c, trigger),

  //   close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),

  //   algo: 'underOver'
  // },
  {
    open: wma => trigger => (p, c) =>  rateAboveWma(c, wma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    algo: 'underUnder'
  }
];

(async () => {
  let allPeriods
  try {
    allPeriods = JSON.parse(await fs.readFileSync(`../../cache/calculatedPeriods/${interval}/${abbrev}.JSON`, 'utf8'))
  } catch (e) {
    return console.error(e)
  }
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())
  const months = getMonthsSinceDate(sinceDate)

  const stats = []
  for (let i = 0; i < algorithms.length; i++) {
    console.log(`ALGORITHM .... ${i}`)
    const algorithm = algorithms[i]

    let algoStats 
    try {
      algoStats = await performAlgorithm(periods, algorithm, daysOfPeriods, months)
    } catch (e) {
      console.log(e)
    }

    console.log(`ALGO STATS ... ${algoStats.length}`)

    stats.push(...algoStats)
  }

  console.log(`all stats ... ${stats.length}`)

  jsonwriter.end()
})();


/**
 * 
 */
const performAlgorithm = async (periods, algorithm, daysOfPeriods, months) => {
  const stats = []

  /* loop wma */ 
  for (let i = 0; i < wmas.length; i ++) {
    const wma = wmas[i]

    console.log(`rate above wma ... ${wma}`)

    const algorithmForWma = {
      open: algorithm.open(wma),
      close: algorithm.close,
      algo: algorithm.algo
    }
    await performStochasticAlgorithm(periods, algorithmForWma, wma, daysOfPeriods, months)
  }

  return stats
}


/**
 * 
 */
const performStochasticAlgorithm = (periods, algorithm, wma, daysOfPeriods, months) => 
  new Promise((resolve, reject) => 
{
  // const stats = []

  /* loop open triggers */
  for (let x = 0; x < 100; x += 5) {
    console.log(`stochastic buy trigger ... ${x}`)

    /* loop close triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }

      /* loop stop loss possibilities */ 
      const stopLossPerformances = []
      for (let spIndex = 0; spIndex < stopLosses.length; spIndex += 1) {
        const stopLoss = stopLosses[spIndex]
        stopLossPerformances.push(
          ...getMonthPerformances(periods)(conditions)(stopLoss)(null)(abbrev)
            (months)
            (daysOfPeriods)
        )
      }

      const performances = [
        ...stopLossPerformances.map((p) => ({
          wma,
          openTrigger: x,  
          closeTrigger: y,
          algo: algorithm.algo,
          ...p
        }))
      ]
      performances.forEach((p) => { jsonwriter.write(p) })
    }
  }

  resolve()
})

