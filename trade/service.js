const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const mkDirAsync = promisify(fs.mkdir)
const uuidGenerator = require('uuid/v1');
const moment = require('moment');
const repo = require('./repository');
const mongoRepo = require('./mongoRepository')
const oandaService = require('../services/oanda')
const logTrade = require('../services/logTrade')
const logger = require('../services/logger');
const { isPublishedAlgorithm } = require('../publishedAlgorithm/service')
const logTransaction = require('../services/publishedTransactionLogger')
const prototypeTrades = require('../schema/prototypeTrades')
const db = require('../dbInstance')

exports.openTrade = async (
  protoNo, 
  currency, 
  rate, 
  notes, 
  stats, 
  timeInterval,
  currencyRateSource,
  conn = db()
) => {
  // console.log('TRADE SERVICE .. OPEN TRADE')

  const uuid = uuidGenerator();
  const abbrev = `${currency}/USD`
  const trade = {
    proto_no: protoNo,
    abbrev,
    open_rate: rate,
    open_notes: '',
    open_stats: stats,
    time_interval: timeInterval,
    account: null,
    uuid
  }

  let publishedAlgorithm
  try { 
    publishedAlgorithm = await isPublishedAlgorithm(protoNo, timeInterval)
  } catch (e) {
    console.log(e)
    console.error('Failed to check if algorithm published, for Oanda opening trade')
    return
  }

  /* create trade in MYSQL */ 
  try {
    await repo.createTrade(trade, conn)
  } catch (err) {
    throw new Error(`could not create trade in MYSQL: ${err}`)
  }


  // console.log('store last trade to json file')
  try {
    await cacheLastTrade(trade)
  } catch (e) {
    console.log(e)
    throw new Error(`Failed to cache last trade`)
  }

  /* create trade in MongoDB */ 
  // try {
  //   await mongoRepo.createTrade(trade)
  // } catch (e) {
  //   throw new Error(`Failed to create trade in MongoDB: ${e}`)
  // }
  
  if (publishedAlgorithm) {
    logTransaction('success', 'open', 'paper', abbrev, uuid)

    /* only open trade on trading plaform for selected prototype on selected interval */
    try {
      await openOandaTrade(uuid, currency)
    } catch (err) {
      logger(`Failed to open oanda trade`, 'danger')
      logTransaction('failure', 'open', 'paper', abbrev, uuid)
    }
  }
}

const openOandaTrade = async (uuid, currency) => {
  console.log('open oanda trade')

  let oandaTradeId
  try {
    oandaTradeId = await oandaService.openTrade(currency)
  } catch (e) {
    logger(`Failed to open oanda trade`, 'danger')
    throw new Error(`Failed to get OANDA open trade id ${e}`)
  }
  // logger(`Created oanda trade: ${oandaTradeId}`, 'success')
  logTransaction('success', 'open', 'oanda', `${currency}/USD`, uuid)

  try {
    await repo.createTradeOandaTradeRel(uuid, oandaTradeId)
  } catch (e) {
    console.error(`Failed to create trade & Oanda trade id relationship: ${e}`)
    logger(`Failed to create oanda trade relationshp in schema`, 'danger')
  }
  // logger('created oanda trade relationship in schema', 'success')
}


exports.closeTrade = async (
  protoNo, 
  currency, 
  rate, 
  notes, 
  timeInterval, 
  openingTrade,
  currencyRateSource
) => {
  // console.log('TRADE SERVICE .. CLOSE TRADE')

  const abbrev = `${currency}/USD`

  // let openingTrade
  // try {
  //   openingTrade = await mongoRepo.getLastTrade(protoNo, abbrev, timeInterval)
  // } catch (e) {
  //   throw new Error('failed to get opening trade')
  // }

  if (openingTrade && openingTrade.closed) {
    logger('opening trade is closed', 'warning')
    throw new Error(`Last trade for proto:${protoNo} abbrev:${abbrev} is closed`);
  }

  /* update to closed in MYSQL */
  const now = new Date();
  const trade = {
    close_rate: rate,
    close_date: moment(now.toISOString()).format('YYYY-MM-DD HH:mm:ss'),
    close_notes: '',
    closed: true,
    account: null
  }
  try {
    await repo.updateTrade(openingTrade.uuid, trade);
  } catch (err) {
    logger('Failed to close paper tArade', 'danger')
    throw new Error(`updating trade for ${openTrade.id}: ${err}`)
  }

  try {
    await closeCachedLastTrade(protoNo, abbrev, timeInterval, trade)
  } catch (e) {
    console.log(e)
    throw new Error('Failed to close cached trade')
  }

  /* update to close in MongoDB */ 
  // try {
  //   await mongoRepo.closeTrade(protoNo, abbrev, timeInterval, rate, notes)
  // } catch (e) {
  //   console.log(e)
  //   throw new Error('Failed to close trade in MongoDB')
  // }

  let publishedAlgorithm
  try { 
    publishedAlgorithm = await isPublishedAlgorithm(protoNo, timeInterval)
  } catch (e) {
    console.error('Failed to check if algorithm published, for Oanda closing trade')
    return
  }

  /* only open trade on trading plaform for selected prototype on selected interval */
  if (publishedAlgorithm) {
    logTransaction('success', 'close', 'paper', abbrev, openingTrade.uuid)

    try {      
      await oandaService.closeTrade(currency, openingTrade.uuid)
    } catch (err) {
      // logger(`Failed to open oanda trade`, 'danger')
      logTransaction('failure', 'close', 'oanda', abbrev, openingTrade.uuid)
      throw new Error(`Failed to close trade on OANDA`)
    }

    logTransaction('success', 'close', 'oanda', abbrev, openingTrade.uuid)
  }
}


/**
 * map abbrev to use understore instead of slash i.e `GBP/USD` => `GBP_USD`
 * (usually to be used an an object property)
 */
exports.mapAbbrevUnderscore = (abbrev) => {
  const baseCurrency = abbrev.substring(0, 3)
  const quoteCurrency = abbrev.substring(4, 7)

  return `${baseCurrency}_${quoteCurrency}`
}

exports.mapAbbrevSlash = (abbrevInstrument) => {
  const baseCurrency = abbrevInstrument.substring(0, 3)
  const quoteCurrency = abbrevInstrument.substring(4, 7)

  return `${baseCurrency}/${quoteCurrency}`
}

/**
 * map interval number to key value in Mongo Schema for interval trades
 */
exports.mapIntervalToString = (interval) => {
  let intervalString = ''

  switch (interval) {
    case 1:
      intervalString = 'One'
      break
    case 2:
      intervalString = 'Two'
      break
    case 3:
      intervalString = 'Three'
      break
    case 5:
      intervalString = 'Five'
      break
    case 15:
      intervalString = 'Fifteen'
      break
    case 30:
      intervalString = 'Thirty'
  }

  return `int${intervalString}Trades`
}

exports.mapStringToInterval = (string) => {
  let interval;

  switch (string) {
    case 'intOneTrades':
      interval = 1
      break
    case 'intTwoTrades':
      interval = 2
      break
    case 'intThreeTrades':
      interval = 3
      break
    case 'intFiveTrades':
      interval = 5
      break
    case 'intFifteenTrades':
      interval = 15
      break
    case 'intThirtyTrades':
      interval = 30
  }

  return interval
}

const cacheLastTrade = async (trade) => {
  const dir = 'cache/lastTrade'

  /* create dir for prototype if it does not exist */
  const prototypeDir = `${dir}/${trade.proto_no}`
  if (!fs.existsSync(prototypeDir)) await fs.mkdirSync(prototypeDir)

  /* create dir for abbrev if it does not exist */
  const abbrevDir = `${prototypeDir}/${this.mapAbbrevUnderscore(trade.abbrev)}`
  if (!fs.existsSync(abbrevDir)) await fs.mkdirSync(abbrevDir)


  try {
    const filename = `${trade.time_interval}.json`
    await fs.writeFileSync(`${abbrevDir}/${filename}`, JSON.stringify(trade))
  } catch (e) {
    console.error(`Failed to cache last trade`)
  }
}

const closeCachedLastTrade = async (prototypeNo, abbrev, interval, closedTrade) => {
  const dir = 'cache/lastTrade'
  const abbrevUnderscore = this.mapAbbrevUnderscore(abbrev)
  const path = `${dir}/${prototypeNo}/${abbrevUnderscore}/${interval}.json`
  
  let lastTrade
  try {
    lastTrade = JSON.parse(await fs.readFileSync(path, 'utf8'))
  } catch (e) {
    throw new Error('Failed to read last trade from cache')
  }

  const updatedClosedTrade = {...lastTrade, ...closedTrade}

  try {
    await cacheLastTrade(updatedClosedTrade)
  } catch (e) {
    console.error('Failed to closed cached last trade')
  }
}

exports.getCachedLastTrade = async (prototypeNo, abbrev, interval) => {
  const dir = 'cache/lastTrade'
  const abbrevUnderscore = this.mapAbbrevUnderscore(abbrev)
  const path = `${dir}/${prototypeNo}/${abbrevUnderscore}/${interval}.json`

  let trade 
  try {
    trade = JSON.parse(await fs.readFileSync(path, 'utf8'))
  } catch (e) {
    // console.log(e)
    throw new Error('Failed to read cached last trade')
  }

  return trade
}