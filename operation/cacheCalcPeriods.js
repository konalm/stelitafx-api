require('module-alias/register');

const fs = require('fs');
const { Worker } = require('worker_threads');
const moment = require('Moment');
const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');
const calcWmaInBatch = require('@/indicators/wma/service/calcWmaInBatch');
const calcStochasticInBatch = require('@/indicators/stochastic/service/calcStochasticInBatch');
const calcAdxInBatch = require('@/indicators/adx/service/calcAdxInBatch')
const calcObcInBatch = require('@/indicators/onBalanceVolume/service/calculateInBatch')
const monthsSinceDate = require('./service/getMonthsSinceDate')
const sinceDate = '2019-01-01T00:00:00.000Z';
const endDate =  new Date();


const interval = 5;
const abbrev= 'GBP/USD';
const min = 1, max = 200;

(async () => {
  /* get candles since date */ 
  // let candles
  // try {
  //   candles = await getCandlesSinceDate(sinceDate, endDate, interval, abbrev)
  // } catch (e) {
  //   return console.error(`Failed to get candles`)
  // }
  // console.log(`candles .... ${candles.length}`)

  // const periods = [...candles].map((x) => ({
  //   date: new Date(x.time),
  //   exchange_rate: parseFloat(x.mid.c),
  //   candle: x.mid,
  //   volume: x.volume
  // }))


  const months = monthsSinceDate(sinceDate)
  months.forEach((x) => {

  })

  console.log(months)


  // TODO 
  // get all years and month since date. 
  // call a worker for each month 

  return 


  periods.forEach((x, periodIndex) => {
    console.log(`i .. ${periodIndex}`)

    /* Calculate WMA */
    x.wma = {}
    for (let i = 100; i <= 200; i+=5) {
      x.wma[i] = calcWmaInBatch(periods, periodIndex, i === 0 ? 1 : i)
    }

    /* Calculate Stochastic */
    x.stochastic = calcStochasticInBatch(periods, periodIndex)

    /* Calculate ADX */ 
    x.adx = calcAdxInBatch(periods, periodIndex)

    /* Calculate OBC */
    x.obc = calcObcInBatch(periods, periodIndex)
  })


  /* Write to cache */
  try {
    await fs.writeFileSync('../cache/calculatedPeriods.JSON', JSON.stringify(periods))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }

  process.exit();
})();


