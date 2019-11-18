const uuidGenerator = require('uuid/v1');
const moment = require('moment');
const repo = require('./repository');
const oandaService = require('../services/oanda')
const logTrade = require('../services/logTrade')
const logger = require('../services/logger');
const { isPublishedAlgorithm } = require('../publishedAlgorithm/service')


exports.openTrade = async (
  protoNo, 
  currency, 
  rate, 
  notes, 
  stats, 
  timeInterval,
  currencyRateSource
) => {
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
  }

  try {
    await repo.createTrade(trade)
  } catch (err) {
    throw new Error(`could not create trade >> ${err}`)
  }

  let publishedAlgorithm
  try { 
    publishedAlgorithm = await isPublishedAlgorithm(protoNo, timeInterval)
  } catch (e) {
    console.error('Failed to check if algorithm published, for Oanda opening trade')
    return
  }

  /* only open trade on trading plaform for selected prototype on selected interval */
  if (publishedAlgorithm) {
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


exports.closeTrade = async (
  protoNo, 
  currency, 
  rate, 
  notes, 
  timeInterval, 
  currencyRateSource
) => {
  console.log('CLOSE TRADE')

  const abbrev = `${currency}/USD`

  let openingTrade;
  try {
    openingTrade = await repo.getLastTrade(
      protoNo, 
      timeInterval, 
      abbrev, 
      currencyRateSource
    )
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


  let publishedAlgorithm
  try { 
    publishedAlgorithm = await isPublishedAlgorithm(protoNo, timeInterval)
  } catch (e) {
    console.error('Failed to check if algorithm published, for Oanda closing trade')
    return
  }

  /* only open trade on trading plaform for selected prototype on selected interval */
  if (publishedAlgorithm) {
    try {      
      await oandaService.closeTrade(currency, openingTrade.uuid)
    } catch (err) {
      logger(`Failed to open oanda trade`, 'danger')
    }
  }
}