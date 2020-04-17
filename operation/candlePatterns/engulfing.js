require('module-alias/register');

const _ = require('lodash');
const yargs = require('yargs');

const args = yargs.argv;
const sinceDate = '2015-01-01T00:00:00.000Z';
const { fetchCandles, candleStats, isTimesBigger } = require('./service');
const { percentage } = require('@/services/utils');


const getBullishEngulf = (candles, times) =>  new Promise((resolve, reject) => {
  const engulfed = []

  let bearsAfterEngulf = 0
  let bullsAfterEngulf = 0

  const c = _.cloneDeep(candles)

  c.forEach((candle, i) => {
    if (i === 0) return

    const prior = i > 0 ? candleStats(c[i - 1]) : null
    const current = candleStats(candle)

    if (prior.type === 'bear' && current.type === 'bull') {
      if (isTimesBigger(current.body, prior.body, times)) {
        candle.engulfed = true
        engulfed.push( { current, prior, date: current.date } )
      } else { 
        candle.engulfed = false
      }
    } else {
      candle.engulfed = false
    }

    if (prior.engulfed) {
      if (current.type === 'bull') bullsAfterEngulf ++
      if (current.type === 'bear') bearsAfterEngulf ++
    }
  })

  console.log(`occurances ... ${bullsAfterEngulf + bearsAfterEngulf}`)
  resolve(percentage(bullsAfterEngulf, bearsAfterEngulf))
});


/**
 * 
 */
(async() => {
  const symbol = args.s
  const candles = await fetchCandles(symbol, sinceDate)

  /* loop * bigger second candle can be */ 
  for (let i = 1; i <= 25; i ++) {
    let bullishEngulf
    try {
      bullishEngulf = await getBullishEngulf(candles, i)
    } catch (e) {
      console.log(e)
    }

    console.log(`i ${i} .. ${bullishEngulf}`)
  }
})();

