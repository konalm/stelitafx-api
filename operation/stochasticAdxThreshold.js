require('module-alias/register');

const fs = require('fs');
const JSONStream = require('JSONStream');
const { daysBetweenDates } = require('@/services/utils');
const { 
  stochasticCrossedOver, 
  stochasticCrossedUnder, 
  adxPlusDiAboveThreshold,
  adxPlusDiBelowThreshold,
  adxBelowThreshold,
  adxAboveThreshold
} = require('@/simulateTradeHistory/service/conditions')
const getPerformance = require('./service/getPerformance');

const abbrev = 'GBPUSD';
const stopLosses = [null, 1, 5, 15, 30, 50]
const sinceDate = '2020-01-01T00:00:00.000Z';

const stream = fs.createWriteStream(`../cache/stats/stochasticAdx/${abbrev}.JSON`)
const jsonwriter = JSONStream.stringify()
jsonwriter.pipe(stream);


const stochasticAlgorithms = [
  {
    open: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),
    algo: 'overUnder'
  },
  {
    open: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
    close: (trigger, p, c) => (p, c) => stochasticCrossedOver(p, c, trigger),
    algo: 'overOver'
  },
  {
    open: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),
    close: trigger => (p, c) => stochasticCrossedOver(p, c, trigger),
    algo: 'underOver'
  },
  {
    open: trigger => (p, c) =>  stochasticCrossedUnder(p, c, trigger),
    close: trigger => (p, c) => stochasticCrossedUnder(p, c, trigger),
    algo: 'underUnder'
  }
];

const adxAlgorithms = [
  {
    open: threshold => (p, c) => adxPlusDiAboveThreshold(p, c, threshold),
    algo: 'plusDIAboveThreshold'
  },
  {
    open: threshold => (p, c) => adxPlusDiBelowThreshold(p, c, threshold),
    algo: 'plusDIBelowThreshold'
  },
  {
    open: threshold => (p, c) => adxBelowThreshold(p, c, threshold),
    algo: 'adxBelowThreshold'
  },
  {
    open: threshold => (p, c) => adxAboveThreshold(p, c, threshold),
    algo: 'adxAboveThreshold'
  }
];


(async () => {
  const allPeriods = JSON.parse(await fs.readFileSync(`../cache/calculatedPeriods/${abbrev}.JSON`, 'utf8'))
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  /* loop adx algorithm  */
  for (let x = 0; x < adxAlgorithms.length; x ++) {
    const adxAlgo = adxAlgorithms[x]
    console.log(`adx ... ${adxAlgo.algo}`)

      /* loop threshold */
    for (let z = 0; z < 100; z += 5) {
      console.log(`threshold ... ${z}`)

      const adxThresholdAlgo = {
        open: adxAlgo.open(z),
        close: adxAlgo.close
      }

      // loop stochastic algoritm 
      for (let y = 0; y < stochasticAlgorithms.length; y ++) {
        const stochasticAlgo = stochasticAlgorithms[y]

        console.log('loop stochastic algo ' + stochasticAlgo.algo)

        await performStochasticAlgorithm(
          periods, adxThresholdAlgo, stochasticAlgo, z, daysOfPeriods
        )
      }
    }
  }

  jsonwriter.end()
})();


const performStochasticAlgorithm = (
  periods, adxAlgo, stochasticAlgo, threshold, daysOfPeriods
) => {
  console.log('perform stochastic')

  /* loop buy triggers */
  for (let x = 0; x < 100; x += 5) {
    console.log(`stochastic buy trigger .. ${x}`)

    /* loop sell triggers */
    for (let y = 5; y <= 100; y += 5) {
      const conditions = {
        open: (p,c) => adxAlgo.open(p, c) && stochasticAlgo.open(x)(p ,c),
        close: stochasticAlgo.close(y)
      }

      /* loop stop losses */ 
      for (let spIndex = 0; spIndex < stopLosses.length; spIndex += 1) {
        let performance = getPerformance(periods)(conditions)(stopLosses[spIndex])
          (null)
          (daysOfPeriods)
          (abbrev)
        performance.openTrigger = x
        performance.closeTrigger = y
        performance.adxAlgo = adxAlgo.algo 
        performance.stochasticAlgo = stochasticAlgo.algo
        performance.threshold = threshold
           
        if (performance) jsonwriter.write(performance);
      }
    }
  }
}

