const fs = require('fs')
const { getTrades } = require('../../trade/repository')
const calculatePip = require('../../services/calculatePip');


module.exports = (abbrevRates) => new Promise(async (resolve, reject) => {
  let stopGains
  try {
    stopGains = JSON.parse(fs.readFileSync(`${__dirname}/stopGainConfig.JSON`, 'utf8'))
  } catch (e) {
    return console.error('Failed to get stop losses from config')
  }

  const prototypeStopGainPromises = []
  stopGains.forEach((x) => {
    prototypeStopGainPromises.push(getPrototypeTradesTriggeringStopGain(x, abbrevRates))
  })

  Promise.all(prototypeStopGainPromises)
    .then((prototypeTradesTriggeringStopGain) => {
      const tradesTriggeringStopGain = []
      prototypeTradesTriggeringStopGain.forEach((x) => {
        tradesTriggeringStopGain.push(...x)
      })

      resolve(tradesTriggeringStopGain)
    })
    .catch((e) => {
      reject(e)
    })
})


/**
 * Get prototypes open trades and return those that have triggered the stop gain
 */
const getPrototypeTradesTriggeringStopGain = async (prototypeStopGainConfig, abbrevRates) => {
  const prototypeNo = prototypeStopGainConfig.prototypeNo
  const intervalStopGains = prototypeStopGainConfig.stopGains

  let openTrades
  try {
    const conditions = {
      proto_no: prototypeNo,
      closed: false
    }
    openTrades = await getTrades(conditions, null) 
  } catch (e) {
    throw new Error(`Failed to get open trades for ${prototypeNo}`)
  }

  const tradesTriggeredStopGain = []
  intervalStopGains.forEach((intervalStopGain) => {
    const intervalOpenTrades = openTrades.filter(
      x => x.timeInterval === intervalStopGain.interval
    )

    intervalOpenTrades.forEach((trade, i) => {
      if (tradeTriggeredStopGain(trade, abbrevRates, intervalStopGain.stopGain)) {
        tradesTriggeredStopGain.push(trade)
      }
    })
  })

  return tradesTriggeredStopGain
}


/**
 * Compare trades open rate with the latest rate of the abbrev of trade and see
 * if the trade price has increased above the prototype interval's stop gain
 * 
 * @param {*} trade - trade to be checked 
 * @param {*} rate - latest rate for the abbrev of trade
 * @param {*} stop gaiin - stop gain of the prototypes interval
 */
const tradeTriggeredStopGain = (trade, abbrevRates, stopGain) => {
  const latestRate = abbrevRates.find(x => x.abbrev === trade.abbrev).exchangeRate
  const openRate = trade.openRate
  const pipDiff = calculatePip(openRate, latestRate)

  return pipDiff >= stopGain
}
