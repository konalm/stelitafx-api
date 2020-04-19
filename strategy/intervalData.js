const service = require('@/algorithms/service');
const config = require('@/config')

module.exports = (interval) => new Promise(async (resolve, reject) => {
  const promises = []
  config.CURRENCYPAIRS.forEach((x) => {
    promises.push(getCurrencyData(x, interval))
  })

  let intervalData 
  try {
    intervalData = await Promise.all(promises)
  } catch (e) {
    reject(e)
  }

  resolve(intervalData)
})


const getCurrencyData = (symbol, interval) => new Promise((resolve, reject) => {
  const abbrev = `${symbol.substring(0,3)}/${symbol.substring(3,6)}`

  Promise.all([
    service.getCurrentAndPrevWMAs(abbrev, interval, null),  
    service.getMovingAverages(abbrev, interval, null),
    service.getCurrentAndPrevStochastic(abbrev, interval),
  ])
    .then(res => {
      const WMAs  = res[0]
      const stochastic = res[2]

      const current = {
        rate:  WMAs.WMA ? WMAs.WMA.rate : null,
        wma: WMAs.WMA ? WMAs.WMA.WMAs : null,
        stochastic: stochastic.current
      }
      const prior = {
        rate: WMAs.prevWMA ? WMAs.prevWMA.rate : null,
        wma: WMAs.prevWMA ? WMAs.prevWMA.WMAs : null,
        stochastic: stochastic.prev
      }

      resolve({
        symbol,
        data: { current, prior }
      })
    })
    .catch(e => {
      console.log('FAILLLL')
      reject(e)
    })
})