const wmaRepo = require('@/wma/repository')
const symbolToAbbrev = require('@/services/symbolToAbbrev')
const useGran = require('@/services/useGran');
const intervalFromGran = require('@/services/intervalFromGran')

const upperGrans = ['H1', 'H2']

/**
 * 
 */
const getPeriods = async (gran, symbol, sinceDate) => {
  const interval = useGran(gran) ? gran : intervalFromGran(gran)
  const periods = await wmaRepo.getWMAFromDate(symbol, interval, sinceDate, new Date())

  return periods
    .map((x) => ({ 
      ...x, 
      wma: x.WMAs, 
      exchange_rate: x.rate 
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * 
 */
module.exports = async (gran, symbol, sinceDate) => {
  const periods = await getPeriods(gran, symbol, sinceDate)

  console.log('periods --> ' + periods.length)

  const upperPeriods = []
  for (let gran of upperGrans) {
    const uPeriods = await getPeriods(gran, symbol, sinceDate)
    upperPeriods.push({ gran, data: uPeriods });
  }

  periods.forEach((p, i) => {
    p.upperPeriods = {}

    for (upperPeriod of upperPeriods) {
      if (!upperPeriod.data.length) continue 

      const interval = intervalFromGran(upperPeriod.gran)

      const d = new Date(upperPeriod.data[0].date)
      d.setMinutes(d.getMinutes() + interval)

      if (new Date(p.date) >= d) upperPeriod.data.splice(0, 1)

      if (upperPeriod.data.length > 0) {
        p.upperPeriods[upperPeriod.gran] = upperPeriod.data[0]
      }
    }
  })

  // console.log(`first period -->`)
  // console.log(periods[0])

  // console.log(`last period -->`)
  // console.log(periods[periods.length - 1])

  return periods
}