require('module-alias/register');

const fs = require('fs');

const { wmaCrossedOver, wmaUnder } = require('@/simulateTradeHistory/service/conditions');
const { daysBetweenDates } = require('@/services/utils');
const getPerformance = require('./service/getPerformance')

const algorithm = {
  open: (shortWma, longWma) => (p, c) => wmaCrossedOver(p, c, shortWma, longWma),
  close: (shortWma, longWma) => (p, c) => wmaUnder(p, c, shortWma, longWma)
};

const sinceDate = '2019-01-01T00:00:00.000Z';
const abbrev = 'GBPCAD';
const stopLosses = [null, 1, 5, 15, 30, 50];


(async () => {
  let allPeriods
  try {
    allPeriods = JSON.parse(await fs.readFileSync(`../cache/calculatedPeriods/${abbrev}.JSON`, 'utf8'))
  } catch (e) {
    return console.error(e)
  }
  const periods = allPeriods.filter((x) => new Date(x.date) >= new Date(sinceDate))

  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())

  const performances = []

  /* loop short wma */
  for (let fastWma = 0; fastWma <= 195; fastWma += 5) {
    console.log(`short wma .. ${fastWma}`)

    /* loop long wma */ 
    for (let slowWma = fastWma + 5; slowWma <= 200; slowWma += 5) {
      console.log(`long wma .. ${slowWma}`)

      const conditions = {
        open: algorithm.open(fastWma === 0 ? 1 : fastWma, slowWma),
        close: algorithm.close(fastWma === 0 ? 1 : fastWma, slowWma)
      }
      
      /* loop stop loss */
      const stopLossPerformances = []
      for (let spIndex = 0; spIndex < stopLosses.length; spIndex += 1) {
        const stopLoss = stopLosses[spIndex]
        stopLossPerformances.push(
          getPerformance(periods)(conditions)(stopLoss)(null)(daysOfPeriods)(abbrev)
        )
      }

      performances.push(
        ...stopLossPerformances.map((x) => ({ fastWma, slowWma, ...x }))
      )
    }
  }

  const validPerformances = performances.filter((x) => x.pipsPerTrade)

  /* write to cache */ 
  try {
    await fs.writeFileSync(
      `../cache/stats/wmaCrossedOver/${abbrev}.JSON`, 
      JSON.stringify(validPerformances)
    )
  } catch (e) {
    throw new Error(e)
  }
})();
