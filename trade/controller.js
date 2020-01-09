const repo = require('./repository.js')
const mongoRepo = require('./mongoRepository')
const oandaService = require('../services/oanda')


exports.getOandaTradeTransactions  = async (req, res) => {
  const tradeId = req.params.id; 
  
  // if account not demo, return 
  let oandaTrade
  try {
    oandaTrade = await repo.getTradeJoinOandaTrade(tradeId)
  } catch (e) {
    console.log(e)
    return res.status(500).send(`Failed to get oanda transaction ids`)
  }

  if (!oandaTrade) return res.status(404).send(`No Oanda trade for ${tradeId}`)

  let transactions
  try {
    transactions = await oandaService.getTransactions([
      oandaTrade.oandaOpenTradeId, 
      oandaTrade.oandaCloseTradeId
    ])
  } catch (e) {
    return res.status(500).send(`Failed to get transactions from oanda`)
  }

  const openTradeTransaction = transactions[0]
  const closeTradeTransaction = transactions.length > 0 ?transactions[1] : {}

  return res.send({ openTradeTransaction, closeTradeTransaction})
}


exports.getProtoIntervalCurrencyTrades = async (req, res) => {
  console.log('prototype interval trades')

  const {protoNo, interval, currency} = req.params  
  const dateTimeFilter = req.query.date || '';
  const conditions = {
    proto_no: parseInt(protoNo),
    time_interval: parseInt(interval),
    abbrev: `${currency}/USD`,
    closed: true,
  }

  let trades
  try {
    trades = await repo.getTrades(conditions, dateTimeFilter)
  } catch (err) {
    return res.status(500).send('Failed to get trades')
  }

  // let trades 
  // try {
  //   trades = await mongoRepo.getPrototypeIntervalTrades(protoNo, parseInt(interval), currency)
  // } catch (e) {
  //   console.log(e)
  //   return res.status(500).send('Failed to get trades')
  // }

  if (!trades.length) return res.status(204).send('No trades')

  return res.send(trades)
}


exports.getProtoIntervalTrades = async (req, res) => {
  const {protoNo, interval} = req.params
  const conditions = {
    proto_no: parseInt(protoNo),
    time_interval: parseInt(interval),
    closed: true,
  }
  const dateTimeFilter = req.query.date || '';


  let trades
  try {
    trades = await repo.getTrades(conditions, dateTimeFilter)
  } catch (err) {
    console.log(err)
    return res.status(500).send(`Failed to get trades`)
  }

  // let trades 
  // try {
  //   trades = await mongoRepo.getPrototypeIntervalTrades(
  //     protoNo, 
  //     parseInt(interval), 
  //     dateTimeFilter
  //   )
  // } catch (e) {
  //   console.log(e)
  //   return res.status(500).send('Failed to get trades')
  // }

  if (!trades.length) return res.status(204).send('No trades!')

  return res.send(trades)
}


exports.updateTradeToViewed = async (req, res) => {
  console.log('updated trade to veiwed')

  const tradeId = req.params.tradeId;
  const trade = { viewed: true };

  console.log(`trade id ... ${tradeId}`)

  try {
    await repo.updateTrade(tradeId, trade);
  } catch (err) {
    return res.status(500).send('Failed to set trade to viewed');
  }

  return res.send(`trade ${tradeId} updated to viewed`);
}


exports.getPrevTrade = async (req, res) => {
  const tradeUUID = req.params.tradeUUID;

  let prevTrade;
  try {
    prevTrade = await repo.getPrevTrade(tradeUUID);
  } catch (err) {
    return res.status(500).send('Unable to get prev trade');
  }

  if (!prevTrade) return res.status(404).send('prev trade not found')

  return res.send({UUID: prevTrade});
}


exports.getNextTrade = async (req, res) => {
  const tradeUUID = req.params.tradeUUID;

  let nextTrade;
  try {
    nextTrade = await repo.getNextTrade(tradeUUID);
  } catch (err) {
    return res.status(500).send('Unable to get next trade');
  }

  return res.send({UUID: nextTrade});
}


exports.getTrade = async (req, res) => {
  const { protoNo, interval, currency, tradeUUID } = req.params;
  const abbrev = `${currency}/USD`
  // const abbrevInstrument = `${req.params.currency}_USD`

  let trade;
  try {
    trade = await repo.getTrade(protoNo, abbrev, tradeUUID);
  } catch (e) {
    return res.status(500).send('Failed to get trade');
  }

  // let trade
  // try {
  //   trade = await mongoRepo.getPrototypeIntervalCurrencyTrade(
  //     protoNo, 
  //     parseInt(interval), 
  //     abbrevInstrument,
  //     tradeUUID
  //   )
  // } catch (e) {
  //   console.log(e)
  //   return res.status(500).send('Failed to get trade')
  // }

  if (!trade) return res.status(404).send('Trade not found');

  return res.send(trade)
}

exports.getTradeV2 = async (req, res) => {
  const {protoNo, interval, currency, tradeId} = req.params
  const conditions = {
    proto_no: protoNo,
    time_interval: interval,
    abbrev: `${currency}/USD`,
    id: tradeId
  }

  let trade
  try {
    trade = await repo.getTrades(conditions)
  } catch (err) {
    return res.status(500).send('Failed to get trade')
  }

  if (!trade) return res.status(404).send('Trade not found')

  return res.send(trade)
}


exports.getTradesProto = async (req, res) => {
  const protoNo = req.params.proto_no;
  const dateFilter = req.query.date || '';

  let trades;
  try {
    trades = await repo.getTradesProto(protoNo, dateFilter)
  } catch (err) {
    return res.status(500).send(`Failed to get trades for proto ${protoNo}`);
  }

  return res.send(trades)
}

exports.getProtoCurrencyClosedTrades = async (req, res) => {
  const protoNo = req.params.proto_no;
  const baseCurrency = req.params.currency;
  const abbrev = `${baseCurrency}/USD`;
  const dateTimeFilter = req.query.date || '';

  let trades;
  try {
    trades = await repo.getProtoCurrencyClosedTrades(protoNo, abbrev, dateTimeFilter);
  } catch (err) {
    return res.status(500).send(
      `Failed to get trades for proto ${protoNo} with currency ${abbrev}`
    );
  }

  return res.send(trades);
}


/**
 * Get all of a proto's trades for a currency
 */
exports.getProtoCurrencyTrades = async (req, res) => {
  const algoId = req.params.algo_id;
  const baseCurrency = req.params.currency;
  const currencyPairAbbrev = `${baseCurrency}/USD`;
  const dateTimeFilter = req.query.date || '';

  let trades;
  try {
    trades = await repo.getCurrencyTrades(algoId, currencyPairAbbrev, dateTimeFilter);
  } catch (err) {
    return res.status(500).send(err);
  }

  return res.send(trades);
}

exports.getLastProtoIntervalCurrencyTrade = async (req, res) => {
  const { protoNo, interval } = req.params;
  const abbrev = `${req.params.currency}/USD`

  let trade;
  try {
    trade = await repo.getLastTrade(protoNo, interval, abbrev)
  } catch (e) {
    return res.status(500).send('Failed to get last trade')
  }

  return res.send(trade)
}
