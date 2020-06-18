require('module-alias/register');
const fs = require('fs')

const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');

const sinceDate = '2019-01-01T00:00:00.000Z';
const endDate = new Date();
const abbrev = 'GBP/USD';
const gran = 'M5';


(async () => {
  /* get 5M candles since date */ 
  let candles5M
  try {
    candles5M = await getCandlesSinceDate(sinceDate, endDate, gran, abbrev)
  } catch (e) {
    return console.error(`Failed to get candles`)
  }

  const periods = [...candles5M].map((x) => ({
    date: new Date(x.time),
    exchange_rate: parseFloat(x.mid.c),
    candle: x.mid,
    volume: x.volume
  }))
  
  // const periods5M = [...periods]

  // const periods5M = []
  // periods.forEach((x, i) => {
  //   console.log(`i .. ${i}`)

  //   if (x.date.getMinutes() % 5 === 0) {
  //     const position = periods1M.findIndex((p) => p.date === x.date)
  //     const relatedCandles = periods1M.splice(0, position + 1)

  //     periods5M.push({
  //       ...x,
  //       oneMinCandles: relatedCandles
  //     })
  //   }
  // })


  /* Write to cache */
  try {
    const cacheFile = `${abbrev.replace('/', '')}.JSON`
    await fs.writeFileSync(
      `../cache/historicCandles/${gran}/${cacheFile}`, 
      JSON.stringify(periods)
    )
  } catch (e) {
    return console.error(e)
  }
})()