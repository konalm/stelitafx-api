const fs = require('fs');
const service = require('./service');
const { getLatestStochastic } = require('../stochastic/repository')
const { getPrototypeAbbrevLatestTrades } = require('../trade/repository')
const { getAbbrevLatestRate } = require('../currencyRates/repository');
// const currencies = require('../config').MAJOR_CURRENCIES
const currencies = ['GBP']


const framework = require('./story/frameworkV2')

const prototypes = [84]

/*******
  pipeline runs algorithms for passed time interval
*******/

module.exports = (interval) => new Promise((resolve, reject) => {
  console.log('STORY PIPEPLINE')

  const intervalAbbrevAlgorithmPromises = []

  currencies.forEach((currency) => {
    const abbrev = `${currency}/USD`
    intervalAbbrevAlgorithmPromises.push( 
      runIntervalAbbrevAlgorithms(interval, abbrev)
    )
  })

  Promise.all(intervalAbbrevAlgorithmPromises)
    .then(() => {

    })
    .catch((e) => {
    
    })
})


const runIntervalAbbrevAlgorithms = (interval, abbrev) => 
  new Promise(async (reject, resolve) => 
{
  // console.log(`run algorithms for ${interval}, ${abbrev}`)

  // get relevant data
  let intervalAbbrevData
  try {
    intervalAbbrevData = await dataForIntervalAbbrev(interval, abbrev)
  } catch (e) {
    console.log(e)
    return reject('Failed to get data for interval abbrev')
  }

  const prototypeFrameworkPromises = []
  prototypes.forEach((no) => {
    const algorithm = {prototype: no, interval, abbrev}
    prototypeFrameworkPromises.push(
      framework(algorithm, intervalAbbrevData)
    )
  })

  Promise.all(prototypeFrameworkPromises)
    .then(res => {
      // console.log('completed prototype framework promises')
      // console.log(res)
    })
    .catch(e => {
      console.log('FAIL !!')
      console.log(e)
    })


  resolve()
})


const dataForIntervalAbbrev = (interval, abbrev) => 
  new Promise(async (resolve, reject) => 
{
  // console.log('data for interval abbrev')

  // want the current rate for interval currency 
  Promise.all([
    service.getCurrentAndPrevWMAs(abbrev, interval),
    getLatestStochastic(abbrev, interval, 2),
    // getAbbrevLatestRate(abbrev)
  ])
    .then(res => {
      const WMAs = res[0]
      const rates = {
        current: WMAs.WMA ? WMAs.WMA.rate : null,
        previous: WMAs.prevWMA ? WMAs.prevWMA.rate : null
      }
      const stochasticsResponse = res[1]
      const stochastics = {
        current: stochasticsResponse.length 
          ? Math.round(stochasticsResponse[0]) 
          : null,
        previous: stochasticsResponse.length > 1 
          ? Math.round(stochasticsResponse[1])
          : null
      }

      resolve({rates, stochastics})
    })
    .catch((e) => {
      console.log(e)
      return reject('Failed to get interval abbrev data')
    })
})