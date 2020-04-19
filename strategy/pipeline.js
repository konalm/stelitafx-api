const fs = require('fs')
const getIntervalData = require('./intervalData')
const triggerTransactions = require('./triggerTransactions')
const mapSymbolsToPrototypeNo = require('@/services/mapSymbolToPrototypeNo')
const dir = 'strategy/strategies'


module.exports = (interval) => new Promise(async (resolve, reject) => {
  console.log('STRATEGY PIPELINE')

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

  const processMasterAlgoPromises = []
  strategies.forEach(async (x) => {
    console.log(`get master algorithms for ${x}`)

    const masterAlgosPath = `${dir}/${x}/masterAlgos`

    let settings
    try {
      settings = require(`@/${dir}/${x}/settings.js`)
    } catch (e) {
      console.log('CATCH')
      console.log(e)
    }

    let masterAlgos
    try {
      masterAlgos = await fs.readdirSync(masterAlgosPath, intervalData)
    } catch (e) {
      console.error(e)
    }

    masterAlgos.forEach((x) => {
      processMasterAlgoPromises.push(
        processMasterAlgo(`${masterAlgosPath}/${x}`, intervalData, interval)
      )
    })
  })


  // processMasterAlgo(
  //   'strategy/strategies/pipsPerDay/masterAlgos/wmaCrossover_long.js', 
  //   intervalData,
  //   2889,
  //   interval
  // )
  //   .then(res => {
  //     console.log(`PROCESSED MASTER ALGO`)

  //     resolve()
  //   })
  //   .catch(e => {
  //     console.log(e)
  //     console.log('CATCH PROMISE ??')

  //     resolve()
  //   })

  Promise.all(processMasterAlgoPromises)
    .then(res => {
      console.log('PROMISE ALL THEN >>')
      console.log(res)
      resolve()
    })
    .catch((e) => {
      console.log('CATCH PROMISE ALL ???')
    })
})


const processMasterAlgo = (masterAlgoPath, intervalData, interval) => 
  new Promise((resolve, reject) => 
{
  console.log(`process master algo ... ${masterAlgoPath}`)

  let masterAlgo = require(`@/${masterAlgoPath}`)

  const triggerTransactionPromises = []

  /* loop each currency pair */ 
  masterAlgo.currencySettings.forEach((x) => {
    const symbol = x.symbol 
    const settings = x.settings
    const symbolData = intervalData.find((x) => x.symbol === symbol).data
    const algoNo = masterAlgo.no + mapSymbolsToPrototypeNo[symbol]

    const conditions = {
      open: x.settings.conditions.open(settings),
      close: x.settings.conditions.close(settings)
    }
    triggerTransactionPromises.push(
      triggerTransactions(symbolData)(conditions)(settings.stopLoss)(null)
        (symbol)
        (masterAlgo.transactionType)
        (algoNo)
        (interval)
        ()
    )
  })

  console.log(`trigger transaction promises ... ${triggerTransactionPromises.length}`)

  // resolve()

  Promise.all(triggerTransactionPromises)
    .then(res => { resolve() })
    .catch(e => {
      console.log(e)
      console.log('PROMISE ALL CATCH')
      resolve()
    })
})


