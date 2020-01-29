const fs = require('fs')
const { closeTrade } = require('../../trade/service')
const { getAbbrevLatestRates } = require('../../currencyRates/repository')
const getTradesTriggeringStopLoss = require('./getTradesTriggeringStopLoss')
const getTradesTriggeringStopGain = require('./getTradesTriggeringStopGain')


/**
 * Implement stop loss for prototypes that have a stop loss on the stop loss config JSON file
 */
module.exports = () => new Promise(async (resolve, reject) => {
  let abbrevRates 
  try {
    abbrevRates = await getAbbrevLatestRates()
  } catch (e) {
    return reject('Failed to get abbrev latest rates')
  }

  let tradesTriggeringStopLoss 
  try {
    tradesTriggeringStopLoss = await getTradesTriggeringStopLoss(abbrevRates)
  } catch (e) {
    console.log(e)
    return reject('Failed to get trades triggering stop loss')
  }

  let tradesTriggeringStopGain
  try {
    tradesTriggeringStopGain = await getTradesTriggeringStopGain(abbrevRates)
  } catch (e) {
    console.log(e)
    return reject('Failed to get trades triggering stop gain')
  }

  try {
    await closeTrades(
      [...tradesTriggeringStopLoss, ...tradesTriggeringStopGain],
      abbrevRates
    )
  } catch (e) {
    return reject('Failed to close trades that triggered stop loss')
  }

  resolve()
})


/**
 * Close all trades that have triggered stop loss and stop gain
 */
const closeTrades = (trades, abbrevRates) => new Promise(async(resolve, _) => {
  const closeTradePromises = []
  trades.forEach((trade) => {
    const latestRate = abbrevRates.find(x => x.abbrev === trade.abbrev).exchangeRate

    closeTradePromises.push(
      closeTrade(
        trade.prototypeNo,
        trade.abbrev.substring(0,3),
        latestRate,
        '',
        trade.timeInterval,
        trade,
        ''
      )
    )
  })

  Promise.all(closeTradePromises)
    .then(() => {
      resolve('all trades closed')
    })
    .catch((e) => {
      console.error(`Failed to close trades: ${e}`)
    })
})
