require('module-alias/register');

const fs = require('fs');
const moment = require('moment');
const { getCurrencyRatesSinceDate } = require('@/currencyRates/repository');
const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');
const service = require('@/simulateTradeHistory/service');
const { Worker } = require('worker_threads');
const secondsBetweenDates = require('@/services/secondsBetweenDates');
const calcWmaInBatch = require('@/indicators/wma/service/calcWmaInBatch');
const calcStochasticInBatch = require('@/indicators/stochastic/service/calcStochasticInBatch');
const calcAdxInBatch = require('@/indicators/adx/service/calcAdxInBatch')

const sinceDate = '2019-12-01T00:00:00.000Z';
const interval = 5;
const abbrev= 'GBP/USD';
const min = 1, max = 200;

(async () => {
  /* get candles since date */ 
  let candles
  try {
    candles = await getCandlesSinceDate(sinceDate, interval, abbrev)
  } catch (e) {
    return console.error(`Failed to get candles`)
  }

  const periods = [...candles].map((x) => ({
    date: new Date(x.time),
    exchange_rate: parseFloat(x.mid.c),
    candle: x.mid,
    volume: x.volume
  }))

  console.log(`periods ... ${periods.length}`)

  periods.forEach((x, periodIndex) => {
    console.log(`i .. ${periodIndex}`)

    /* Calculate WMA */
    x.wma = {}
    for (let i = min; i <= max; i++) {
      x.wma[i] = calcWmaInBatch(periods, periodIndex, i)
    }

    /* Calculate Stochastic */
    x.stochastic = calcStochasticInBatch(periods, periodIndex)

    /* Calculate ADX */ 
    x.adx = calcAdxInBatch(periods, periodIndex)
  })

  console.log('writing to file')
  

  /* Write to cache */
  try {
    await fs.writeFileSync('../cache/calculatedPeriods.JSON', JSON.stringify(periods))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }

  process.exit();
})();
