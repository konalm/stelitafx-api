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
const calculatePip = require('../services/calculatePip')
const xtbService = require('../xtb/service')


exports.openTrade = async (
  protoNo, 
  currency, 
  rate, 
  notes, 
  stats, 
  timeInterval,
  conn = db(),
  transactionType = 'long'
) => {
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
    uuid,
    transaction_type: transactionType
  }

  // console.log('trade service open trade ..' + abbrev)
  // console.log(trade)


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
    await repo.createTrade(trade)
  } catch (err) {
    console.log('failed to create trade.' + err)
    throw new Error(`could not create trade in MYSQL: ${err}`)
  }

  try {
    await cacheLastTrade(trade)
  } catch (e) {
    console.log(e)
    console.log('failed to cache last trade')
    throw new Error(`Failed to cache last trade`)
  }

  
  if (publishedAlgorithm) {
    console.log('published algorithm')

    /* open trade on xtb for published alogorithms */ 
    try {
      await xtbService.openTrade(uuid, abbrev, rate, transactionType)
    } catch (e) {
      console.log(e)
      throw new Error('Failed to open trade on xtb')
    }

    /* only open trade on trading plaform for selected prototype on selected interval */
    // try {
    //   await openOandaTrade(uuid, currency)
    // } catch (err) {
    //   logger(`Failed to open oanda trade`, 'danger')
    //   logTransaction('failure', 'open', 'paper', abbrev, uuid)
    // }
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
) => {
  const abbrev = `${currency}/USD`

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
    logger('Failed to close paper trade', 'danger')
    throw new Error(`updating trade for ${openTrade.id}: ${err}`)
  }

  try {
    await closeCachedLastTrade(protoNo, abbrev, timeInterval, trade)
  } catch (e) {
    console.log(e)
    throw new Error('Failed to close cached trade')
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
    // logTransaction('success', 'close', 'paper', abbrev, openingTrade.uuid)

    try {
      await xtbService.closeTrade(openingTrade.uuid, abbrev)
    } catch (e) {
      console.log(e)
      throw new Error('Failed to close trade on xtb')
    }

    // try {      
    //   await oandaService.closeTrade(currency, openingTrade.uuid)
    // } catch (err) {
    //   logTransaction('failure', 'close', 'oanda', abbrev, openingTrade.uuid)
    //   throw new Error(`Failed to close trade on OANDA`)
    // }

    // logTransaction('success', 'close', 'oanda', abbrev, openingTrade.uuid)
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
    console.log(e)
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


exports.abstractLongTradePerformance = (trade, wmaData) => {
  if (!wmaData.length) return

  // const low = null

  const low = wmaData.reduce((prev, curr) => prev.rate < curr.rate ? prev : curr)
  const high = wmaData.reduce((prev, curr) => prev.rate > curr.rate ? prev : curr)

  // const rates = wmaData.map(x => x.rate)

  // return { low, high, rates }

  return {
    low: { 
      date: low.date, 
      rate: low.rate,
      pips: calculatePip(trade.openRate, low.rate) 
    },
    high: {
      date: high.date,
      rate: high.rate,
      pips: calculatePip(trade.openRate, high.rate)
    }
  }
}

exports.abstractShortTradePerformance = (trade, wmaData) => {
  if (!wmaData.length) return

  const low = wmaData.reduce((prev, curr) => prev.rate < curr.rate ? prev : curr)
  const high = wmaData.reduce((prev, curr) => prev.rate > curr.rate ? prev : curr)

  if (trade.id === 438153) {
    console.log('ANALYSES ME :)')

    console.log('high >>>>>')
    console.log(high)

    console.log('low >>>>>>')
    console.log(low)
  }


  return {
    low: {
      date: high.rate,
      rate: high.rate,
      pips: calculatePip(high.rate, trade.openRate) 
    },
    high: {
      date: low.date,
      rate: low.rate,
      pips: calculatePip(low.rate, trade.openRate)
    }
  }
}


exports.xtbTransactionStats = (trade) => {
  const openTransaction = JSON.parse(trade.openTradeTransactionJson)
  const closeTransaction = JSON.parse(trade.closeTradeTransactionJson)
  const closeState = closeTransaction.state
  const closeStatus = closeTransaction.status
  const latestRate = trade.openNotes ? JSON.parse(trade.openNotes) : null
  const rateOnClose = trade.closeNotes ? JSON.parse(trade.closeNotes) : null
  const historicTrade = trade.xtb_historic_trade_json 
    ? JSON.parse(trade.xtb_historic_trade_json)
    : null;
  const brokerPips =  trade.transactionType === 'short' 
  ? calculatePip(closeStatus.bid, openTransaction.ask)
  : calculatePip(openTransaction.ask, closeStatus.bid)

  
  return {
    paperPips: trade.pips,
    brokerPips,
    openRate: {
      paperBid: trade.openRate,
      brokerAsk: openTransaction.ask,
      askDifference: calculatePip(trade.openRate, openTransaction.ask),
      brokerBid: openTransaction.bid,
      bidDifference: calculatePip(trade.openRate, openTransaction.bid),      
      paperOpenDate: moment(trade.openDate).format('HH : mm : ss'),
      brokerOpenDate: closeState.open_timeString,
      latestBid: latestRate ? latestRate.bid : null,
      latestBidDifference: latestRate 
        ? calculatePip(openTransaction.bid, latestRate.bid)
        : null,
      latestAsk: latestRate ? latestRate.ask : null,
      latestAskDifference: latestRate 
        ? calculatePip(openTransaction.ask, latestRate.ask)
        : null
    },
    closeRate: {
      paper: trade.closeRate,
      brokerAsk: closeStatus.ask,
      askDifference: calculatePip(trade.closeRate, closeStatus.ask),
      brokerBid: closeStatus.bid,
      bidDifference: calculatePip(trade.closeRate, closeStatus.bid),
      lastestBid: rateOnClose ? rateOnClose.bid : null,
      lastestBidDifference: rateOnClose ? calculatePip(latestRate.bid, rateOnClose.bid) : null,
      latestAsk: rateOnClose ? rateOnClose.ask : null,
      latestAskDifference: rateOnClose ? calculatePip(latestRate.ask, rateOnClose.ask) : null
    },
    tradeState: {
      brokerPips,
      bokerPipsOnBid:  calculatePip(closeStatus.bid, openTransaction.bid),
      openCloseDiff: calculatePip(closeState.open_price, closeState.close_price) * -1,
      openCheck: calculatePip(openTransaction.ask, closeState.open_price),
      closeCheck: rateOnClose ? calculatePip(rateOnClose.bid, closeState.close_price) : null,
      profit: closeState.profit,
      commission: closeState.commission,
      volume: closeState.volume,
      openRate: closeState.open_price,
      openDifference: calculatePip(trade.openRate, closeState.open_price),
      closeRate: closeState.close_price,
      closeDifference: calculatePip(trade.closeRate, closeState.close_price)
    }
    // historicTrade: {
    //   profit: historicTrade.profit,
    //   openRate: historicTrade.open_price,
    //   closeRate: historicTrade.close_price,
    //   paperOpenDiff: calculatePip(trade.openRate, historicTrade.close_price),
    //   brokerBidOpenDiff: calculatePip(openTransaction.bid, historicTrade.close_price),
    //   brokerAskOpenDiff: calculatePip(openTransaction.ask, historicTrade.close_price),
    //   bidAskSpread: historicTrade.commission,
    //   historicOpenCloseDiff: calculatePip(historicTrade.open_price, historicTrade.close_price)
    // }
  }
}