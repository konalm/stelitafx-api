


// data for interval + currency 

module.exports = (timeInterval, abbrev) => new Promise(async (resolve, reject) => {


})


class storyAlgorithmFramework {
  constructor() {

  }

  openSteps() {
    return [
      {
        step: 1,
        conditions: [
          stochasticBelow(20)
        ]
      },
      {
        step: 2,
        conditions: [
          [stochasticIncreased(), stochasticSameAsPrev()],
          stochasicBelow(20)
        ]
      }
    ]
  }

  closeSteps() {

  }
}




const intervalCurrencyData = (timeInterval, currency) => {
  Promise.all([
    service.getCurrentAndPrevWMAs(abbrev, timeInterval, currencyRateSrc),  
    getLatestStochastic(abbrev, timeInterval),
    getPrototypeAbbrevLatestTrades(abbrev, timeInterval)
  ])
    .then(res => {
      const WMAs  = res[0]
      const currentRate = WMAs.WMA ? WMAs.WMA.rate : null
      const stochastic = res[1]
      const lastTrades = res[2]

      // TODO  want stochastic and previous stochastic 

      resolve({ WMAs, currentRate, stochastic, lastTrades })
    })
    .catch(e => {
      console.log('FAILLLL')
      reject(e)
    })
}