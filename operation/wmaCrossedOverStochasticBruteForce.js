require('module-alias/register');

const fs = require('fs');
const JSONStream = require('JSONStream');
const { 
  wmaOver, stochasticCrossedOver, stochasticCrossedUnder 
} = require('@/simulateTradeHistory/service/conditions');
const getPerformance = require('./service/getPerformance');
const { daysBetweenDates } = require('@/services/utils');

const abbrev = 'GBPUSD';
const stopLosses = [null, 1, 5, 15, 30, 50]
// const wmas = [1, 5, 15, 30, 50, 100, 150, 200];
const wmas = [50, 100, 150, 200];

const sinceDate = '2016-01-01T00:00:00.000Z';

const stream = fs.createWriteStream(`../cache/stats/wmaCrossedOverStochastic/${abbrev}.JSON`)
const jsonwriter = JSONStream.stringify()
jsonwriter.pipe(stream);


const algorithms = [
  {
    open: (shortWma, longWma) => trigger => (p, c) => wmaOver(c, shortWma, longWma) 
      && stochasticCrossedOver(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    cacheFilename: 'overUnder'
  },
  {
    open: (shortWma, longWma) => trigger => (p, c) => wmaOver(c, shortWma, longWma) 
      && stochasticCrossedOver(p, c, trigger),

    close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),

    cacheFilename: 'overOver'
  },
  {
    open: (shortWma, longWma) => trigger => (p, c) =>  wmaOver(c, shortWma, longWma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),

    cacheFilename: 'underOver'
  },
  {
    open: (shortWma, longWma) => trigger => (p, c) =>  wmaOver(c, shortWma, longWma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    cacheFilename: 'underUnder'
  }
];


(async () => {
  let allPeriods
  try {
    allPeriods = JSON.parse(await fs.readFileSync(`../cache/calculatedPeriods/${abbrev}.JSON`, 'utf8'))
  } catch (e) {
    return console.error(e)
  }
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())


  /* loop every algorithm */ 
  for (let i = 0; i < algorithms.length; i++) {
    console.log(`ALGORITHM .... ${i}`)
    const algorithm = algorithms[i]

    try {
      await performAlgorithm(periods, algorithm, daysOfPeriods)
    } catch (e) {
      console.log(e)
    }
  }

  jsonwriter.end()
})();


const performAlgorithm = async (periods, algorithm, daysOfPeriods) => {
  /* loop every short wma */
  for (let i = 0; i < wmas.length; i ++) {
    const shortWma = wmas[i]

    console.log(`short wma ... ${shortWma}`)

    /* loop every long wma */
    for (let y = i + 1; y < wmas.length; y ++) {
      const longWma = wmas[y]

      console.log(`long wma ... ${longWma}`)

      const algorithmForWmaOver = {
        open: algorithm.open(shortWma, longWma),
        close: algorithm.close,
        cacheFilename: algorithm.cacheFilename
      }
      await performStochasticAlgorithm(
        periods, algorithmForWmaOver, daysOfPeriods, {short: shortWma, long: longWma}
      )
    }
  }
}


const performStochasticAlgorithm = (periods, algorithm, daysOfPeriods, wmas) => {
  /* loop buy triggers */
  for (let x = 95; x < 100; x += 5) {
    /* loop sell triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }

      /* loop stop losses */ 
      for (let spIndex = 0; spIndex < stopLosses.length; spIndex += 1) {
        let stopLossPerformance = getPerformance(periods)(conditions)(stopLosses[spIndex])
          (null)
          (daysOfPeriods)
          (abbrev)
        stopLossPerformance.buyTrigger = x;
        stopLossPerformance.sellTrigger = y;
        stopLossPerformance.wmas = wmas;
   
        if (stopLossPerformance) jsonwriter.write(stopLossPerformance);
      }
    }
  }
}


