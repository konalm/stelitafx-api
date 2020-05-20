const fs = require('fs')
const { getTrades } = require('../../trade/repository')
const calculatePip = require('../../services/calculatePip');


/**
 * Get open trades that have triggered the stop loss
 */
module.exports = (abbrevRates) => new Promise(async (resolve, reject) => {
  let stopLossesJSON
  try {
    stopLossesJSON = fs.readFileSync(`${__dirname}/stopLossConfig.JSON`, 'utf8')
  } catch (e) {
    return console.error('Failed to get stop losses from config')
  }
  const stopLosses = JSON.parse(stopLossesJSON)

  const prototypeStopLossPromises = []
  stopLosses.forEach((x) => {
    prototypeStopLossPromises.push(getPrototypeTradesTriggeringStopLoss(x, abbrevRates))
  })

  Promise.all(prototypeStopLossPromises)
    .then((prototypeTradesTriggeringStopLoss) => {
      const tradesTriggeringStopLoss = [] 
      prototypeTradesTriggeringStopLoss.forEach((x) => {
        tradesTriggeringStopLoss.push(...x)
      })

      resolve(tradesTriggeringStopLoss)
    })
    .catch((e) => {
      reject(e)
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
const getPrototypeTradesTriggeringStopLoss = async (prototypeStopLossConfig, abbrevRates) => {
  const prototypeNo = prototypeStopLossConfig.prototypeNo
  const intervalStopLosses = prototypeStopLossConfig.stopLosses

  let openTrades
  try {
    const conditions = {
      proto_no: prototypeNo,
      closed: false
    }
    openTrades = await getTrades(conditions, null) 
  } catch (e) {
    console.error(e)
    throw new Error(`Failed to get open trades for ${prototypeNo}`)
  }

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

  return tradesTriggeredStopLoss
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
  const pipDiff = trade.transactionType !== 'short' 
    ? calculatePip(openRate, latestRate, trade.abbrev)
    : calculatePip(openRate, latestRate, trade.abbrev) * -1

  return pipDiff <= (stopLoss * -1)
}