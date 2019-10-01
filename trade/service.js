const uuidGenerator = require('uuid/v1');
const moment = require('moment');
const repo = require('./repository');
const oandaService = require('../services/oanda')
const logTrade = require('../services/logTrade')
const logger = require('../services/logger');


exports.openTrade = async (protoNo, currency, rate, notes, stats, timeInterval) => {
  const uuid = uuidGenerator();
  const account = getAccount(protoNo, timeInterval)
  const abbrev = `${currency}/USD`
  const trade = {
    proto_no: protoNo,
    abbrev,
    open_rate: rate,
    open_notes: notes,
    open_stats: stats,
    time_interval: timeInterval,
    account,
    uuid
  };

  try {
    await repo.createTrade(trade)
  } catch (err) {
    throw new Error(`could not create trade >> ${err}`)
  }
  logger(`stored paper trade in the DB: ${uuid}`, 'success');
  logger(`account type: ${account}`, 'info')

  /* only open trade on trading plaform for selected prototype on selected interval */
  if (account === 'demo' || account === 'live') {
    try {
      await openOandaTrade(uuid, currency)
    } catch (err) {
      logger(`Failed to open oanda trade`, 'danger')
    }
  }
}

const openOandaTrade = async (uuid, currency) => {
  let oandaTradeId
  try {
    oandaTradeId = await oandaService.openTrade(currency)
  } catch (e) {
    console.error(`Failed to get OANDA open trade id ${e}`)
    logger(`Failed to open oanda trade`, 'danger')
    return 
  }
  logger(`Created oanda trade: ${oandaTradeId}`, 'success')

  try {
    await repo.createTradeOandaTradeRel(uuid, oandaTradeId)
  } catch (e) {
    console.error(`Failed to create trade & Oanda trade id relationship: ${e}`)
    logger(`Failed to create oanda trade relationshp in schema`, 'danger')
  }
  logger('created oanda trade relationship in schema', 'success')
}


exports.closeTrade = async (protoNo, currency, rate, notes, timeInterval) => {
  const abbrev = `${currency}/USD`

  let openingTrade;
  try {
    openingTrade = await repo.getLastTrade(protoNo, timeInterval, abbrev);
  } catch (err) {
    throw new Error(`Getting last trade: ${err}`)
  }
  if (openingTrade && openingTrade.closed) {
    logger('opening trade is closed', 'warning')
    throw new Error(`Last trade for proto:${protoNo} abbrev:${abbrev} is closed`);
  }
  logger(`got opening trade ${openingTrade.uuid}`, 'success')

  const now = new Date();
  const account = getAccount(protoNo, timeInterval)
  const trade = {
    close_rate: rate,
    close_date: moment(now.toISOString()).format('YYYY-MM-DD HH:mm:ss'),
    close_notes: notes,
    closed: true,
    account
  }

  try {
    await repo.updateTrade(openingTrade.id, trade);
  } catch(err) {
    logger('Failed to close paper trade in schema', 'danger')
    throw new Error(`updating trade for ${openTrade.id}: ${err}`)
  }
  logger(`closed paper trade in schema`, 'success')

  logger(`account: ${account}`, 'info')

  /* only open trade on trading plaform for selected prototype on selected interval */
  if (account === 'demo' || account == 'live') {
    try {
      await oandaService.closeTrade(currency, openingTrade.uuid)
    } catch (e) {
      logger('failed to close oanda trade', 'danger')
      throw new Error(`Failed to close Oanda trade`)
    }
  }

}

/**
 * Get the type of account trade is to be made on; paper, oanda demo of oanda live account
 */
const getAccount = (prototypeNo, timeInterval) => {
  if (prototypeNo === 1) {
    if (timeInterval === 15) return 'demo'
  }

  return 'paper'
}