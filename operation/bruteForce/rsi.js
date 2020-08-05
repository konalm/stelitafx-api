require('module-alias/register');
const fs = require('fs')

const fetchPeriods = require('@/operation/service/fetchCalcPeriods')
const calcRsiInBatch = require('@/indicators/rsi/service/calcRsiInBatch')
const periodsToCandles = require('@/operation/service/periodsToCandles')
const getPerformance = require('@/operation/service/getPerformance')
const { daysBetweenDates } = require('@/services/utils');
const { 
  periodHigh, 
  periodLow,
  upperTrendUp,
  trendUp,
  rateAboveWma,
  alwaysTrue,
  rsiAbove,
  rsiBelow
} = require('@/simulateTradeHistory/service/conditions')

const gran = 'M5'
const symbol = 'GBPUSD'
const sinceDate = '2018-01-01T00:00:00.000Z';


const algos = [
  // {
  //   open: (candles, length) => (p, c) => periodLow(c, candles, length)
  //     && upperTrendUp(c.upperHACandles['H1'])
  //     && upperTrendUp(c.upperHACandles['H4'])
  //     && rateAboveWma(c, 200),
  //   close: (candles, length) => (p, c) => periodHigh(c, candles, length),
  //   desc: 'Day low & day high'
  // },
  {
    open: (thresh) => (p, c) => rsiBelow(c, thresh)
      // && rateAboveWma(c, 50)
      // && upperTrendUp(c.upperHACandles['H1'])
      // && upperTrendUp(c.upperHACandles['H4']),
      && trendUp(c.upperHACandles['H4'])
      && trendUp(c.upperHACandles['H1']),

    close: (thresh) => (p, c) => rateAboveWma(c, 5),
    desc: 'RSI__closeOnRateAbove'
  }
];

(async () => {
  const periods = await fetchPeriods(gran, symbol, sinceDate)
  const daysOfPeriods = daysBetweenDates(periods[0].date)(new Date())
  const candles = periodsToCandles(periods)
  const rsiLength = 6

  periods.forEach((period, i) => {
    const rsi = calcRsiInBatch(candles, i, rsiLength)
    period.rsi = rsi
  })

  for (let i = 0; i < algos.length; i++) {
    await performAlgo(periods, algos[i], daysOfPeriods, candles)
  }
})();


const performAlgo = async (periods, algo, daysOfPeriods, candles) => {
  const stopLoss = null 
  const takeProfit = null

  const performances = []
  
  /* loop open triggers  */
  for (let openTrigger = 0; openTrigger <= 100; openTrigger += 5) {
    /* loop close triggers */
    for (let closeTrigger = openTrigger + 5; closeTrigger <= 100; closeTrigger += 5) {
      const conditions = {
        open: algo.open(openTrigger),
        close: algo.close(closeTrigger)
      }
      
      const performance = getPerformance(periods)(conditions)(stopLoss)(takeProfit)
        (daysOfPeriods)
        (symbol)
        ()
      performance.openTrigger = openTrigger
      performance.closeTrigger = closeTrigger
      performance.desc = algo.desc

      performances.push(performance)
    }
  }

  console.log(`performances .. ${performances.length}`)

  /* write to cache */
  try {
    await fs.writeFileSync(
      `../../cache/stats/rsi/${gran}/${symbol}.JSON`, JSON.stringify(performances)
    )
  } catch (e) {
    console.log(e)
    throw new Error('Failed to write RSI to cache')
  }
}