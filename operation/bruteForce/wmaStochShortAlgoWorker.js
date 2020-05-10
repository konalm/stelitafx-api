require('module-alias/register');

const { workerData } = require('worker_threads');
const { periods, interval, abbrev, algo, months, daysOfPeriods } = workerData; 
const { 
  stochasticCrossedOver, stochasticCrossedUnder, wmaUnder
} = require('@/simulateTradeHistory/service/conditions');
const getMonthPerformances = require('@/operation/service/getMonthPerformances');
const fs = require('fs');
const JSONStream = require('JSONStream');

const PATH  = `../../cache/stats/wmaStoch/short/${interval}/${abbrev}`;
const stream = fs.createWriteStream(`${PATH}/${algo}.JSON`)
const jsonwriter = JSONStream.stringify()
jsonwriter.pipe(stream);

// const stopLosses = [null, 1, 5, 15, 50];
const stopLosses = [null];
// const stopGains = [null, 1, 5, 15, 50];
const stopGains = [];
// const stopLosses = [null];
const wmas = [1, 5, 15, 30, 50, 100, 150, 200];
// const wmas = [5, 15, 30, 50, 100];

const algorithms = [
  // {
  //   open: (shortWma, longWma) => trigger => (p, c) => wmaUnder(c, shortWma, longWma) 
  //     && stochasticCrossedOver(p, c, trigger),

  //   close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

  //   algo: 'overUnder'
  // },
  {
    open: (shortWma, longWma) => trigger => (p, c) => wmaUnder(c, shortWma, longWma) 
      && stochasticCrossedOver(p, c, trigger),

    close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),

    algo: 'overOver'
  },
  // {
  //   open: (shortWma, longWma) => trigger => (p, c) =>  wmaUnder(c, shortWma, longWma) 
  //     && stochasticCrossedUnder(p, c, trigger),

  //   close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),

  //   algo: 'underOver'
  // },
  {
    open: (shortWma, longWma) => trigger => (p, c) =>  wmaUnder(c, shortWma, longWma) 
      && stochasticCrossedUnder(p, c, trigger),

    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),

    algo: 'underUnder'
  }
];


const performStochasticAlgorithm = async (periods, algorithm, wmas, months, jsonwriter) => {
  /* loop buy triggers */
  for (let x = 0; x < 100; x += 5) {
    /* loop sell triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {  open: algorithm.open(x),  close: algorithm.close(y) }
      const writePerformancesF = writePerformances(x, y, wmas, algorithm.algo, jsonwriter)

      /* loop stop losses */ 
      for (let slIndex = 0; slIndex < stopLosses.length; slIndex += 1) {
        const sl = stopLosses[slIndex]
        const stopLossPerformances = getMonthPerformances(periods)(conditions)(sl)
          (null)
          (abbrev)
          (months)
          (daysOfPeriods)
        writePerformancesF(stopLossPerformances)
      }

      /* loop stop gains */ 
      for (let sgIndex = 0; sgIndex < stopGains.length; sgIndex += 1) {
        const sg = stopGains[sgIndex]
        const stopGainsPerformances = getMonthPerformances(periods)(conditions)(null)
          (sg)
          (abbrev)
          (months)
          (daysOfPeriods)
        writePerformancesF(stopGainsPerformances)
      }
    }
  }
};


const writePerformances = (openT, closeT, wmas, algo, jsonwriter) => stopPerformances => {
  const performances = stopPerformances.map((p) => ({
    ...p,
    buyTrigger: openT, 
    sellTrigger: closeT,
    wmas,
    stochAlgo: algo
  }))

  performances.forEach((p) => jsonwriter.write(p) )
};


(async () => {
  const algorithm = algorithms.find((x) => x.algo === algo)

  /* loop every short wma */
  for (let i = 0; i < wmas.length - 1; i ++) {
    const shortWma = wmas[i]

    /* loop every long wma */
    for (let y = i + 1; y < wmas.length; y ++) {
      const longWma = wmas[y]

      const algorithmForWmaOver = {
        open: algorithm.open(shortWma, longWma),
        close: algorithm.close,
        algo: algorithm.algo
      }
      
      await performStochasticAlgorithm(
        periods, algorithmForWmaOver, {short: shortWma, long: longWma}, months, jsonwriter
      )
    }
  }

  jsonwriter.end();
})();
