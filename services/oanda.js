const axios = require('axios');
const tradeRepo = require('../trade/repository')
const logger = require('../services/logger');
const env = require('../env.js');

const apiSecret = env.OANDA_LIVE_API_SECRET;
const accountId = env.OANDA_LIVE_ACCOUNT_ID;

const apiUrl = 'https://api-fxtrade.oanda.com/v3/'
const demoAccountUrl = `${apiUrl}accounts/${accountId}`
const options = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiSecret}`
  }
};

exports.openTrade = async (currency) => {
  const instrument = `${currency}_USD`
  const units = 100;
  const payload = {
    order: {
      units,
      instrument,
      timeInForce: "FOK",
      type: "MARKET",
      positionFill: "DEFAULT"
    }
  }

  // logger('made order request to oanda, waiting for response ...', 'info')

  let openTradeResponse
  try {
    openTradeResponse = await axios.post(`${demoAccountUrl}/orders`, payload, options)
  } catch (e) {
    console.log(e.response)
    logger('request to open order on oanda failed', 'danger');
    throw new Error(e)
  } finally {
    // logger('got response back from oanda for order request', 'info')
  }

  if (!openTradeResponse.data.hasOwnProperty("orderFillTransaction")) {
    logger('failed to get order filled response from Oanda', 'warning');
    throw new Error('Failed to get order filled')
  } else {
    // logger('Have order filled response', 'success')
  }

  return openTradeResponse.data.orderFillTransaction.id
}

exports.closeTrade = async (currency, openingTradeUUID) => {
  console.log('CLOSE TRADE ON OANDA')

  // logger('close trade on Oanda', 'info');

  let oandaOpeningTrade
  try {
    oandaOpeningTrade = await tradeRepo.getOandaTradeRel(
      ['oanda_opentrade_id'],
      {trade_uuid: openingTradeUUID}
    )
  } catch (e) {
    logger('failed to get Oanda opening trade', 'danger')
    throw new Error(`Failed to get Oanda opening trade ${e}`)
  }

  const oandaOpeningTradeId = oandaOpeningTrade.oanda_opentrade_id;
  // logger(`got oanda opening trade from schema: ${oandaOpeningTradeId}`, 'success')

  // logger(`waiting for close trade response from oanda`, 'info')
  const path = `/trades/${oandaOpeningTradeId}/close`
  const payload = { units: 'ALL' }
  let closeTradeResponse;
  try {
    closeTradeResponse = await axios.put(`${demoAccountUrl}${path}`, payload, options)
  } catch (e) {
    logger('request to close trade in oanda failed', 'danger')
    logTra
    throw new Error(`Failed to close Oanda trade`)
  } finally {
    // logger('got response back from oanda to close trade', 'info')
  }

  if (!closeTradeResponse.data.hasOwnProperty('orderFillTransaction')) {
    logger ('Failed to get request to close filled', 'danger')
    throw new Error('Failed to get close trade filled')
  } else {
    // logger('Have order to close trade filled response', 'success')
  }

  const closeTradeId = closeTradeResponse.data.orderFillTransaction.id;
  // logger(`close trade, transaction id: ${closeTradeId}`, 'info')

  try {
    const data = { oanda_closetrade_id: closeTradeId }
    await tradeRepo.updateOandaTradeRel(data, openingTradeUUID)
  } catch (e) {
    logger('Failed to update oanda trade relationship with close trade', 'danger')
    throw new Error(`Failed to update oanda trade rel with close id: ${e}`)
  }
  // logger('updated oanda trade relationshp schema with close id', 'success')
}

const getAbbrevOpenTrades = async (instrument) => {
  /* collect Id of all trades for abbrev (should only be 1) */
  let response;
  try {
    response = await axios.get(`${demoAccountUrl}/openTrades`, options)
  } catch (err) {
    console.error(err)
  }

  const abbrevTrades = response.data.trades.filter(x => x.instrument === instrument)
  return abbrevTrades.map(x => x.id)
}


exports.getTransactions = async (transactionIds) => {
  const transactionPromises = []  
  transactionIds.forEach((id) => {
    /* promise for each transactions request so they can be resolve in parralel */
    const promise = new Promise((resolve) => {
      const url = `${demoAccountUrl}/transactions/${id}`

      axios.get(url, options)
        .then((res) => {
          resolve(res.data.transaction)
        })
        .catch((e) => {
          console.error(e)
          resolve()
        })
    })
    transactionPromises.push(promise)
  })

  try {
    transactions = await Promise.all(transactionPromises)
  } catch (e) {
    throw new Error(`Failed to resolve transactions: ${e}`)
  }

  return transactions
}