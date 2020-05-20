const fs = require('fs')
const getIntervalData = require('./intervalData')
const triggerTransactions = require('./triggerTransactions')
const mapSymbolsToPrototypeNo = require('@/services/mapSymbolToPrototypeNo')
const dir = 'strategy/strategies'


module.exports = (interval) => new Promise(async (resolve, reject) => {
  let strategies
  try {
    strategies = await fs.readdirSync(dir)
  } catch (e) {
    return console.error(e)
  }

  let intervalData 
  try {
    intervalData = await getIntervalData(interval)
  } catch (e) {
    return console.error(e)
  }

  const strategyPromises = []
  strategies.forEach(async (x, i) => {
    strategyPromises.push( processStrategy(x, intervalData, interval) )
  })

  Promise.all(strategyPromises)
    .then(() => {
      console.log('STRATEGY PROMISES COMPLETE')
      resolve()
    })
    .catch((e) => {
      console.log('CATCH PROMISE ALL ???')
      console.log(e)
    })
})


const processStrategy = (path, intervalData, interval) => 
  new Promise(async (resolve, reject) => 
{
  const masterAlgosPath = `${dir}/${path}/masterAlgos`

  let masterAlgos
  try {
    masterAlgos = await fs.readdirSync(masterAlgosPath, intervalData)
  } catch (e) {
    console.error(e)
  }

  const masterAlgoPromises = []
  masterAlgos.forEach((x) => {
    masterAlgoPromises.push(
      processMasterAlgo(`${masterAlgosPath}/${x}`, intervalData, interval)
    )
  })

  console.log('master algos >>')
  console.log(masterAlgos)

  Promise.all(masterAlgoPromises)
    .then(res => {
      console.log('PROCESS MASTER ALGO PROMISES COMPLETE')
      resolve()
    })
    .catch((e) => {
      console.log('CATCH PROMISE ALL ???')
      console.log(e)
    })
})


const processMasterAlgo = (path, intervalData, interval) => new Promise((resolve, _) => {
  let masterAlgo = require(`@/${path}`)

  const triggerTransactionPromises = []

  /* loop each currency pair */ 
  masterAlgo.currencySettings.forEach((x) => {
    const symbol = x.symbol 
    const settings = x.settings
    const symbolData = intervalData.find((x) => x.symbol === symbol).data
    const algoNo = masterAlgo.no + mapSymbolsToPrototypeNo[symbol]

    triggerTransactionPromises.push(
      triggerTransactions(symbolData)(x.settings.conditions)(settings.stopLoss)(null)
        (symbol)
        (masterAlgo.transactionType)
        (algoNo)
        (interval)        
    )
  })

  Promise.all(triggerTransactionPromises)
    .then(res => { 
      // console.log(`TRIGGER TRANSACTIONS PROMISES RESOLVED ... ${path}`)
      resolve() 
    })
    .catch(e => {
      console.log('PROMISE ALL CATCH')
      console.log(e)
      resolve()
    })
})


