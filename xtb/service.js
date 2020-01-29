const WebSocket = require('ws');
const { 
  login, 
  logout, 
  openTradeTransaction, 
  getTradeStatus, 
  getOpenTrades, 
  closeTradeTransaction,
  getPrices,
  getAbbrevPrice

} = require('./xtbApiService')
const repo = require('./repository')
const ADDRESS = 'wss://ws.xtb.com/demo'
const currencyRateRepo = require('../currencyRates/repository')
const tradeRepo = require('../trade/repository')

exports.openTrade = (tradeUUID, abbrev, price) => new Promise(async (resolve, reject) => {
  console.log('XTB SERVICE .. OPEN TRADE')

  const ws = new WebSocket(ADDRESS)

  ws.on('open', async function open() {
    console.log('open')

    /* Login */
    try {
      await login(ws)
    } catch (e) {
      return reject('Failed to login')
    }

    console.log('login')

    let abbrevPrice
    try {
      abbrevPrice = await getAbbrevPrice(ws, abbrev)
    } catch (e) {
      console.log(e)
      console.error(`Failed to get abbrev price for ${abbrev}`)
    }

    let currencyRate
    try {
      currencyRate = await currencyRateRepo.getCurrencyRate(abbrev)
    } catch (e) {
      return reject('Failed to get currency rate')
    }

    try {
      const tradeUpdateModel = {
        open_notes: JSON.stringify(abbrevPrice)
      }
      tradeRepo.updateTrade(tradeUUID, tradeUpdateModel)
    } catch (e) {
      console.error('Failed to update trade with abbrev price form XTB')
    }


    /* Open trade */
    let tradeTransaction 
    try {
      const symbol = abbrev.replace("/", "")
      tradeTransaction = await openTradeTransaction(ws, symbol, currencyRate.ask)
    } catch (e) {
      return reject('Open trade transaction failed')
    }


    /* Get status of the open trade transaction request */
    let tradeStatus
    try {
      tradeStatus = await getTradeStatus(ws, tradeTransaction.returnData.order)
    } catch (e) {
      return reject('Failed to get trade status')
    }

    /* Store the trade transaction information */ 
    try {
      await repo.storeTradeTransaction(tradeStatus)
    } catch (e) {
      return reject(`Failed to store xtb open trade transaction: ${e}`)
    }

    /* Store the relationship of the trade and xtb open trade */ 
    try {
      await repo.storeTradeRel(tradeUUID,  tradeStatus.order)
    } catch (e) {
      return reject(`Failed to store xtb trade relationship: ${e}`)
    }

    /* Logout */
    try {
      await logout(ws)
    } catch (e) {
      return reject('Failed to logout')
    }

    resolve()
  })
})


exports.closeTrade = (tradeUUID, abbrev) => new Promise(async (resolve, reject) => {
  console.log('XTB SERVICE ... CLOSE TRADE')
  console.log(tradeUUID)

  // get xtb opening trade id from the trade rel table 
  let tradeRel 
  try {
    tradeRel = await repo.getTradeRel(tradeUUID)
  } catch (e) {
    return reject('Failed to find xtb trade relationship for trade: ' + tradeUUID)
  }
  const xtbOpeningTradeId = tradeRel.xtbOpenTradeId

  console.log('xtb opening trade id ... ' + xtbOpeningTradeId)


  const ws = new WebSocket(ADDRESS)

  ws.on('open', async function open() {
    console.log('open')

    /* Login */
    try {
      await login(ws)
    } catch (e) {
      return reject('Failed to login')
    }

    console.log('logged in')

    /* Get the relevant open trade that is to be closed */
    let openTrades 
    try {
      openTrades = await getOpenTrades(ws)
    } catch (e) {
      return console.error('Failed to get open trades')
    }

    // console.log('open trades >>>')
    // console.log(openTrades)

    const tradeToClose = openTrades.returnData.find(x => x.order2 === xtbOpeningTradeId)

    // console.log('trade to close >>>>')
    // console.log(tradeToClose)

    let abbrevPrice
    try {
      abbrevPrice = await getAbbrevPrice(ws, abbrev)
    } catch (e) {
      console.log(e)
      console.error(`Failed to get abbrev price for ${abbrev}`)
    }

    try {
      const tradeUpdateModel = {
        close_notes: JSON.stringify(abbrevPrice)
      }
      tradeRepo.updateTrade(tradeUUID, tradeUpdateModel)
    } catch (e) {
      console.error('Failed to update trade with abbrev price form XTB')
    }



    /* Close trade */
    let tradeTransaction
    try {
      tradeTransaction = await closeTradeTransaction(ws, tradeToClose)
    } catch (e) {
      return reject('Failed to close trade')
    }

    // console.log('transaction >>>>')
    // console.log(tradeTransaction)


    /* get status of the closing trade transaction */
    let tradeStatus 
    try {
      tradeStatus = await getTradeStatus(ws, tradeTransaction.returnData.order)
    } catch (e) {
      console.log(e)
      return reject('Failed to get trade status of close trade transaction')
    }

    console.log('close trade .. trade status >>>>>')
    console.log(tradeStatus)

 
    /* Store the trade transaction information */
    const transactionData = {
      state: tradeToClose,
      status: tradeStatus
    }
    try {
      await repo.storeCloseTradeTransaction(transactionData)
    } catch (e) {
      return reject(`Failed to store xtb close trade transaction: ${e}`)
    }


    console.log('update trade rel ...')

    /* Store the relationship of the trade and xtb close trade */
    try {
      await repo.updateTradeRel(tradeUUID, tradeStatus.order)
    } catch (e) {
      return reject(`Failed to store xtb close trade relationship: ${e}`)
    }

    /* Logout */
    try {
      await logout(ws)
    } catch (e) {
      return reject('Failed to logout')
    }

    resolve()
  })
})


exports.getCurrencyRates = () => new Promise((resolve, reject) => {
  console.log('xtb service .. get currency rates')

  const ws = new WebSocket(ADDRESS)

  ws.on('open', async function open() {
    console.log('opened')

    /* Login */
    try {
      await login(ws)
    } catch (e) {
      return reject('Failed to login')
    }

    /* Fetch the prices */ 
    let prices 
    try {
      prices = await getPrices(ws)
    } catch (e) {
      console.log(e)
      return reject('Failed to get get prices')
    }

    /* logout */
    try {
      await logout(ws)
    } catch (e) {
      return reject('Failed to logout')
    }

    resolve(prices)
  })
})


exports.getAbbrevRate = () => new Promise((resolve, reject) => {
  ws.on('open', async function open() {
    console.log('opened')

    /* Login */
    try {
      await login(ws)
    } catch (e) {
      return reject('Failed to login')
    }

    /* Fetch the prices */ 
    let prices 
    try {
      prices = await getPrices(ws)
    } catch (e) {
      console.log(e)
      return reject('Failed to get get prices')
    }

    /* logout */
    try {
      await logout(ws)
    } catch (e) {
      return reject('Failed to logout')
    }

    resolve(prices)
  })
})