const fs = require('fs')
const { getTrades, updateTradesToClosed } = require('../trade/repository')
const { getPrototypeOpenTrades } = require('../trade/mongoRepository')
const tradeService = require('../trade/service')
const { getAbbrevLatestRates } = require('../currencyRates/repository')
const calculatePip = require('../services/calculatePip')
const dbConnections = require('../dbConnections')
const { MAJOR_CURRENCIES } = require('../config')


/**
 * Implement stop loss for prototypes that have a stop loss on the stop loss config JSON file
 */
module.exports = () => new Promise(async (resolve, _) => {
  console.log('stop loss')

  let stopLossesJSON
  try {
    stopLossesJSON = fs.readFileSync(`${__dirname}/stopLossConfig.JSON`, 'utf8')
  } catch (e) {
    return console.error('Failed to get stop losses from config')
  }
  const stopLosses = JSON.parse(stopLossesJSON)

  let abbrevRates 
  try {
    abbrevRates = await getAbbrevLatestRates()
  } catch (e) {
    console.error('failed to get abbrev latest rates')
    reject(e)
    // throw new Error(e)
  }
  // await dbConnections('get abbrev latest rates for stop loss')

  console.log('got abbrev latest rates :)')

  const implementStopLossPromises = []
  stopLosses.forEach((x) => {
    implementStopLossPromises.push(prototypeImplementStopLoss(x, abbrevRates))
  })

  Promise.all(implementStopLossPromises)
    .then(() => {
      console.log('IMPLEMENTED STOP LOSS PROMISES :)')
      resolve()
    })
    .catch((e) => {
      console.error(`implementing stop losses failed: ${e}`)
      reject()
    })
})


/**
 * Get all of trades open for the prototype, sort the trades by their time interval then 
 * using the stop loss for that time interval and latest rate for the relavant currency/abbrev
 * rate, figure out if trades have triggered their stop loss. Proceed to close all trades
 * that have triggered stop loss. 
 * 
 * @param {*} prototypeStopLossConfig - contains prototype no and the stop loss for all
 *  it's belonging time intervals
 * @param {*} abbrevRates - latest rates for each abbrev
 */
const prototypeImplementStopLoss = async (prototypeStopLossConfig, abbrevRates) => {
  console.log('prototype implement stop loss')

  const prototypeNo = prototypeStopLossConfig.prototypeNo
  const intervalStopLosses = prototypeStopLossConfig.stopLosses


  console.log('get open trades')

  let openTrades
  try {
    const conditions = {
      proto_no: prototypeNo,
      closed: false
    }
    openTrades = await getTrades(conditions, null) 
  } catch (e) {
    console.error(e)
    return console.error('failed to get open trades for prototype implement stop loss')
    // throw new Error(`Failed to get open trades for ${prototypeNo}`)
  }

  console.log('got response from open trades :)')


  const tradesTriggeredStopLoss = []
  intervalStopLosses.forEach((intervalStopLoss) => {
    const intervalOpenTrades = openTrades.filter(
      x => x.timeInterval === intervalStopLoss.interval
    )

    intervalOpenTrades.forEach((trade, i) => {
      if (tradeTriggeredStopLoss(trade, abbrevRates, intervalStopLoss.stopLoss)) {
        tradesTriggeredStopLoss.push(trade)
      }
    })
  })

  console.log('trades triggering stop loss .....' + tradesTriggeredStopLoss.length)

  if (!tradesTriggeredStopLoss.length) return

  console.log('close trades for prototype implement stop loss')
  try {
    await closeTrades(tradesTriggeredStopLoss, abbrevRates)
  } catch (e) {
    console.log('failed to close trades for implement stop loss')
    console.log(e)
    throw new Error('Failed to close trades that triggered stop loss')
  }
}


/**
 * Compare trades open rate with the latest rate of the abbrev of trade and see
 * if the trade price has dropped below the prototype interval's stop loss
 * 
 * @param {*} trade - trade to be checked 
 * @param {*} rate - latest rate for the abbrev of trade
 * @param {*} stopLoss - stop loss of the prototypes interval
 */
const tradeTriggeredStopLoss = (trade, abbrevRates, stopLoss) => {
  const latestRate = abbrevRates.find(x => x.abbrev === trade.abbrev).exchangeRate
  const openRate = trade.openRate
  const pipDiff = calculatePip(latestRate, openRate)

  return pipDiff >= stopLoss
}


const closeTrades = async (trades, abbrevRates) => {
  try {
    await updateTradesToClosed(trades, abbrevRates)
  } catch (e) {
    console.error(e)
    throw new Error()
  }
}
