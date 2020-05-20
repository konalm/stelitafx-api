const service = require('@/algorithm/service');

const intervalAbbrevData = (symbol, currency) => 
  new Promise(async (resolve, reject) => 
{
  const abbrev = `${symbol.subString(0,2)}/${symbol.subString(3, 6)}`
  
  Promise.all([
    service.getCurrentAndPrevWMAs(abbrev, timeInterval, currencyRateSrc),  
    service.getMovingAverages(abbrev, timeInterval, currencyRateSrc),
    service.getCurrentAndPrevStochastic(abbrev, timeInterval),
    service.getCurrentAndPriorMacdItems(timeInterval, abbrev)
  ])
    .then(res => {
      const WMAs  = res[0]
      const movingAverages = res[1]
      const currentRate = WMAs.WMA ? WMAs.WMA.rate : null
      const stochastic = res[2]
      const macd = res[3]

      resolve({ movingAverages, WMAs, currentRate, stochastic, macd })
    })
    .catch(e => {
      console.log('FAILLLL')
      reject(e)
    })

})