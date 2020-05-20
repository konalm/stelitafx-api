require('module-alias/register');
const fs = require('fs')
const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');
const symbolToAbbrev = require('@/services/symbolToAbbrev')
const { fetchCandles } = require('@/services/bitfinex')


const interval = 15;
const gran = `M${interval}`;
// const upperGrans = ['H4'];
const symbol = 'ETHBTC'
const sinceDate = '2019-01-01T00:00:00.000Z';
const crypto = true

if (!crypto) upperGrans = ['H1', 'H2', 'H4', 'H6', 'H12'];
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
  let m1Periods
  if (!crypto) m1Periods = await getPeriods('M1');
  if (crypto) m1Periods = await fetchCandles(symbol, 'M1', sinceDate)

  console.log(`periods .. ${periods.length}`)
  console.log(`m1 periods .. ${m1Periods.length}`)


  const upperPeriods = []
  for (let gran of upperGrans) {
    const uPeriods = await getCalcPeriods(gran)
    upperPeriods.push({ gran, data: uPeriods });
  }

  periods.forEach((p, i) => {
    console.log(i)

    const d = new Date(p.date)
    d.setMinutes(d.getMinutes() + interval) 
    const spliceIndex = m1Periods.findIndex((x) => x.date >= d)
    
    /* Assign M1 periods */
    p.m1Candles = m1Periods.splice(0, spliceIndex)
    
    p.upperPeriods = {}
    for (upperPeriod of upperPeriods) {
      const relatedUpperPeriods = upperPeriod.data.filter((x) => 
        new Date(x.date) <=  new Date(p.date)
      )

      p.upperPeriods[upperPeriod.gran] = relatedUpperPeriods[relatedUpperPeriods.length - 1]
    }
  })


  console.log('final example >>')
  console.log(periods[0])

  /* Write to cache */
  try {
    const cacheFile = `../cache/calculatedPeriods/withRelatedUpper/${gran}/${symbol}.JSON`
    await fs.writeFileSync(cacheFile, JSON.stringify(periods))
  } catch (e) {
    throw new Error('Failed to write to cache')
  }

  process.exit()
})();
