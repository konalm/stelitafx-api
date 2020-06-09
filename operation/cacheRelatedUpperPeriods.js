require('module-alias/register');
const fs = require('fs')
const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');
const symbolToAbbrev = require('@/services/symbolToAbbrev')
const { fetchCandles } = require('@/services/bitfinex')
const intervalFromGran = require('@/services/intervalFromGran')
const hourFromGran = require('@/services/hourFromGran')

const interval = 5
const gran = `M${interval}`;
// const upperGrans = ['H4'];
const symbol = 'GBPCAD'
const sinceDate = '2017-01-01T00:00:00.000Z';
const crypto = false
const { 
  dateStripMins, dateStripSecs, dateMinusHours, dateAddHours
} = require('@/services/utils')

if (!crypto) upperGrans = ['H1', 'H2'];
else upperGrans = ['H1', 'H3', 'H6', 'H12']


const getCalcPeriods = async (gran) => {
  let periods 
  try {
    const filePath = `../cache/calculatedPeriods/${gran}/${symbol}.JSON`
    periods = JSON.parse(await fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    return console.error(e)
  }

  return periods.filter((x) => new Date(x.date) >= new Date(sinceDate))
};

const getPeriods = async (gran) => {
  let candles
  try {
    candles = await getCandlesSinceDate(sinceDate, new Date(), gran, symbolToAbbrev(symbol))
  } catch (e) {
    console.log(e)
    return console.error(`Failed to get candles`)
  }

  const periods = [...candles].map((x) => ({
    date: new Date(x.time),
    exchange_rate: parseFloat(x.mid.c),
    rate: parseFloat(x.mid.c),
    candle: x.mid,
    volume: x.volume
  }))

  return periods 
};


(async () => {
  let periods = await getCalcPeriods(gran);

  // let m1Periods
  // if (!crypto) m1Periods = await getPeriods('M1');
  // if (crypto) m1Periods = await fetchCandles(symbol, 'M1', sinceDate)
  // let periods = await getPeriods('M1')

  console.log(`periods .. ${periods.length}`)

  const upperPeriods = []
  for (let gran of upperGrans) {
    const uPeriods = await getCalcPeriods(gran)
    upperPeriods.push({ gran, data: uPeriods });
  }

  periods.forEach((p, i) => {
    if (i % 1000 === 0) console.log(`period .. ${i}`)

    // const d = new Date(p.date)
    // d.setMinutes(d.getMinutes() + interval) 
    // const spliceIndex = m1Periods.findIndex((x) => x.date >= d)
    
    /* Assign M1 periods */
    // p.m1Candles = m1Periods.splice(0, spliceIndex)

    const d = new Date(p.date)
    
    p.upperPeriods = {}
    for (upperPeriod of upperPeriods) {
      if (!upperPeriod.data.length) continue 
      
      const hour = hourFromGran(upperPeriod.gran)
      const granCloseDate = dateAddHours(upperPeriod.data[0].date, hour)

      /* upper period not available */ 
      if (d < granCloseDate) continue 

      /* exceeded closing date of most current upper period date */
      if (d >= dateAddHours(granCloseDate, hour)) upperPeriod.data.splice(0,1)

      p.upperPeriods[upperPeriod.gran] = upperPeriod.data[0]
    }
  })

  const validPeriods = periods.filter((x) => 
    x.upperPeriods.hasOwnProperty('H1') && x.upperPeriods.hasOwnProperty('H2')
  )

  console.log(`periods .. ${periods.length}`)
  console.log(`valid periods .. ${validPeriods.length}`)

  /* Write to cache */
  try {
    const cacheFile = `../cache/calculatedPeriods/withRelatedUpper/${gran}/${symbol}.JSON`
    await fs.writeFileSync(cacheFile, JSON.stringify(validPeriods))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }

  process.exit()
})();
