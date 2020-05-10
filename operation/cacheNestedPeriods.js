const fs = require('fs')

const gran = 'M30';
const innerGran = 'M5';
const abbrev = 'GBPCAD';

const getCalcPeriods = async (gran) => {
  const allPeriods = JSON.parse(
    await fs.readFileSync(`../cache/calculatedPeriods/${gran}/${abbrev}.JSON`, 'utf8')
  )

  return allPeriods
    .map((x) => ({
      ...x,
      date: x.date,
      rate: x.exchange_rate,
      exchange_rate: x.exchange_rate
    }))
}

const getPeriods = async (gran) => {
  let candles
  try {
    candles = await getCandlesSinceDate(sinceDate, endDate, gran, abbrev)
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
}


(async () => {
  const periods = await getCalcPeriods(gran)
  const m5Periods = await getPeriods(innerGran)

  periods.forEach((x, i) => {
    const d = new Date(x.date)
    d.setMinutes(d.getMinutes() + 30)
    
    const m5Index = m5Periods.findIndex((item) => item.date == x.date)

    /* remove unrequired m5 periods */
    if (m5Index > 7) m5Periods.splice(0, m5Index)

    x.m5Periods = m5Periods.splice(0, 6)
  })


  try {
    await fs.writeFileSync(
      `../cache/calculatedPeriods/${gran}${innerGran}/${abbrev}.JSON`, JSON.stringify(periods)
    )
  } catch (e) {
    console.error(e)
  }
 

})();