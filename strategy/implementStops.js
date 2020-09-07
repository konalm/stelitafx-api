const fs = require('fs')
const mapSymbolsToPrototypeNo = require('@/services/mapSymbolToPrototypeNo')
const { getCachedLastTrade, closeTrade } = require('@/trade/service')
const { TIME_INTERVALS, CURRENCYPAIRS } = require('@/config')
const getCurrencyPairLatestRates = require('@/currencyRates/services/getCurrencyPairLatestRates')
const calculatePip = require('@/services/calculatePip');
const addPipsToRate = require('@/services/addPipsToRate');
const minusPipsToRate = require('@/services/minusPipsFromRate');

const DIR = 'strategy/strategies'


module.exports = () => new Promise(async (resolve, reject) => {
  console.log('Strategy Implement Stops')

  let strategies 
  try {
    strategies = await fs.readdirSync(DIR)
  } catch (e) {
    return console.error(e)
  }

  let currencyPairRates
  try {
    currencyPairRates = await getCurrencyPairLatestRates()
  } catch (e) {
    return console.error('Failed to get currency pair latest rates')
  }

  const promises = []
  strategies.forEach(async (x, i) => {
    promises.push( processStrategy(x, currencyPairRates) )
  })

  Promise.all(promises)
    .then(() => {
      console.log('IMPLEMENT STOPS COMPLETE')
      resolve()
    })
    .catch(e => {
      console.log(e)
      resolve()
    })
})

const processStrategy = (path, currencyPairRates) => 
  new Promise(async (resolve, reject) => 
{
  const masterAlgoPath = `${DIR}/${path}/masterAlgos`

  let masterAlgos 
  try {
    masterAlgos = await fs.readdirSync(masterAlgoPath)
  } catch (e) {
    console.log(e)
  }

  // console.log('master algos >>')
  // console.log(masterAlgos)

  const promises = []
  masterAlgos.forEach((x) => {
    promises.push(processMasterAlgo(`${masterAlgoPath}/${x}`, currencyPairRates))
  })

  Promise.all(promises)
    .then(res => {
      console.log('PROCESS STRATEGY COMPLETE')
      resolve()
    })
    .catch(e => {
      console.log(e)
      console.log('PROCESS STRATEGY FAILED')
    })
})

const processMasterAlgo = (path, currencyPairRates) => new Promise((resolve, _) => {
  const masterAlgo = require(`@/${path}`)

  const promises = []
  masterAlgo.currencySettings.forEach((x) => {
    const protoNo = masterAlgo.no + mapSymbolsToPrototypeNo[x.symbol]
    promises.push(
      processStops(
        protoNo, 
        x.symbol, 
        x.settings.stopLoss, 
        x.settings.takeProfit, 
        masterAlgo.transactionType, 
        currencyPairRates[x.symbol][0]
      )
    )
  })

  Promise.all(promises)
  .then(res => {
    console.log('PROCESS MASTER ALGOS COMPLETE')
    resolve()
  })
  .catch(e => {
    console.log('PROCESS STOPS FAILED')
  })
})


const processStops = (protoNo, currencyPair, stopLoss, takeProfit, transactionType, latestRate) => 
  new Promise(async (resolve, reject) => 
{
  if (!stopLoss && !takeProfit) return resolve()

  for (let i = 0; i < TIME_INTERVALS.length; i++) {
    const interval = TIME_INTERVALS[i]
    // console.log(`loop interval .. ${interval}`)

    let openingTrade 
    try {
      openingTrade = await getCachedLastTrade(protoNo, currencyPair, interval)
    } catch (e) {
      console.error(`Failed to get cached last trade for ${protoNo}, ${currencyPair}, ${interval}`)
      continue
    }

    if (openingTrade && !openingTrade.closed) {
      const rate = openingTrade.open_rate 
    
      if (transactionType === 'short') {
        if (takeProfit) {
          console.log(`short triggered stop profit`)
          if (calculatePip(rate, latestRate.low, currencyPair) <= takeProfit * -1) {
            const closingRate = minusPipsToRate(rate, takeProfit, openingTrade.abbrev)
            await closeTrade(protoNo, currencyPair, closingRate, '', interval, openingTrade)
            continue
          }
        }

        if (stopLoss) {
          console.log('short triggered stop loss')
          if (calculatePip(rate, latestRate.high, currencyPair) >= stopLoss) {
            const closingRate = addPipsToRate(rate, stopLoss, openingTrade.abbrev)
            await closeTrade(protoNo, currencyPair, closingRate, '', interval, openingTrade)
            continue
          }
        }
      }

      if (transactionType === 'long') {
        if (stopLoss) {
          console.log('long triggered stop loss')
          if (calculatePip(rate, latestRate.low, currencyPair) <= stopLoss * -1) {
            const closingRate = minusPipsToRate(rate, takeProfit, openingTrade.abbrev)
            await closeTrade(protoNo, currencyPair, closingRate, '', interval, openingTrade)
            continue
          }
        }

        if (takeProfit) {
          console.log('long triggered take profit')
          if (calculatePip(rate, latestRate.high, currencyPair) >= takeProfit) {
            const closingRate = addPipsToRate(rate, stopLoss, openingTrade.abbrev)
            await closeTrade(protoNo, currencyPair, closingRate, '', interval, openingTrade) 
            continue
          }
        }
      }
    }
  }

  resolve()
})