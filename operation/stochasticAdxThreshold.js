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
const sinceDate = '2018-01-01T00:00:00.000Z';

const stream = fs.createWriteStream(`../cache/stats/stochasticAdxThreshold/${abbrev}.JSON`)
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
  // {
  //   open: threshold => (p, c) => adxPlusDiBelowThreshold(p, c, threshold),
  //   algo: 'plusDIBelowThreshold'
  // },
  // {
  //   open: threshold => (p, c) => adxBelowThreshold(p, c, threshold),
  //   algo: 'adxBelowThreshold'
  // },
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

    await performAlgo(adxAlgo, periods, daysOfPeriods)
  }

  jsonwriter.end()
})();


const performAlgo = async (adxAlgo, periods, daysOfPeriods) => {
  console.log('PERFORM ADX ALGO')

  let min = 0
  let max = 100
  if (adxAlgo.algo === 'plusDIAboveThreshold') min = 45; max = 55;
  if (adxAlgo.algo === 'plusDIBelowThreshold') min = 15; max = 40;
  if (adxAlgo.algo === 'adxBelowThreshold') min = 10; max = 15;
  if (adxAlgo.algo === 'adxAboveThreshold') min = 25; max = 55;


  /* loop threshold */
  for (let x = min; x < max; x += 5) {
    console.log(`loop threshold ... ${x}`)

    const adxThresholdAlgo = { 
      open: adxAlgo.open(x), 
      close: adxAlgo.close, 
      algo: adxAlgo.algo 
    }

    // loop stochastic algoritm 
    for (let y = 0; y < stochasticAlgorithms.length; y ++) {
      const stochasticAlgo = stochasticAlgorithms[y]

      await performStochasticAlgorithm(
        periods, adxThresholdAlgo, stochasticAlgo, x, daysOfPeriods
      )
    }
  }
}

const performStochasticAlgorithm = (
  periods, adxAlgo, stochasticAlgo, threshold, daysOfPeriods
) => {
  console.log('PERFORM STOCHASTIC ALGO')

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

