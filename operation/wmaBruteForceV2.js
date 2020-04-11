require('module-alias/register');

const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');


(async () => {
   /* get candles since date */ 
   let candles
   try {
     candles = await getCandlesSinceDate(sinceDate, endDate, interval, abbrev)
   } catch (e) {
     return console.error(`Failed to get candles`)
   }
   console.log(`candles .... ${candles.length}`)
 
   const periods = [...candles].map((x) => ({
     date: new Date(x.time),
     exchange_rate: parseFloat(x.mid.c),
     candle: x.mid,
     volume: x.volume
   }))

   periods.forEach((x, periodIndex) => {
      /* Calculate WMA */
      x.wma = {}
      for (let i = 100; i <= 200; i+=5) {
        x.wma[i] = calcWmaInBatch(periods, periodIndex, i === 0 ? 1 : i)
      }
   })


})