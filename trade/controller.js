const repo = require('./repository')
const service = require('./service')
const oandaService = require('../services/oanda')
const wmaRepo = require('../wma/repository')
const volatilityRepo = require('../volatility/repository')


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

  if (!trades.length) return res.status(204).send('No trades')

  return res.send(trades)
}


exports.getProtoIntervalTrades = async (req, res) => {
  console.log('get proto interval trades !!')

  const {protoNo, interval} = req.params
  const conditions = {
    proto_no: parseInt(protoNo),
    time_interval: parseInt(interval),
    closed: true,
  }
  const dateTimeFilter = req.query.date || '';

  console.log('conditions ....')
  console.log(conditions)

  console.log('date time filter ....')
  console.log(dateTimeFilter)


  let trades
  try {
    trades = await repo.getTrades(conditions, dateTimeFilter)
  } catch (err) {
    console.log(err)
    return res.status(500).send(`Failed to get trades`)
  }

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
  console.log('get trade !!')

  const { protoNo, currency, tradeUUID } = req.params;
  const abbrev = `${currency}/USD`

  let trade;
  try {
    trade = await repo.getTrade(protoNo, abbrev, tradeUUID);
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get trade');
  }


  if (!trade) return res.status(404).send('Trade not found');

  return res.send(trade)
}

exports.getTradeV2 = async (req, res) => {
  console.log('get trade !!');

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


exports.getPrototypeTradeAnalyses = async (req, res) => {
  console.log('get prototype trade analyses !!')

  const dateTimeFilter = req.query.date || '';
  const interval = req.params.interval;
  
  let trades
  try {
    const conditions = {
      proto_no: parseInt(req.params.prototypeNo),
      time_interval: parseInt(interval),
      closed: true,
    }
    trades = await repo.getTrades(conditions, dateTimeFilter)
  } catch (e) {
    return res.status(500).send(`Failed to get trades`)
  }

  const earliestDate = trades[trades.length - 1].openDate
  const latestDate = trades[0].closeDate

  let wmaData
  try {
    wmaData = await wmaRepo.getWMAFromDate(null, interval, earliestDate, latestDate)
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get wma data')
  }

  let volatility
  try {
    volatility = await volatilityRepo.getVolatilityBetweenDates(
      interval, earliestDate, latestDate
    )
  } catch (e) {
    console.log(e)
    return res.status(500).send('Failed to get volatility data')
  }

  const tradePerformances = []
  trades.forEach((t, i) => {

    const relevantWMAData = wmaData.filter((w) => {
      return w.abbrev === t.abbrev 
        && new Date(w.date) >= new Date(t.openDate) 
        && new Date(w.date) <= new Date(t.closeDate)
    })

    const openingVolatility = volatility.find((x) => t.abbrev === x.abbrev 
      && new Date(t.openDate).getHours() === new Date(x.date).getHours()
      && new Date(t.openDate).getMinutes() === new Date(x.date).getMinutes()
    )
    t.openingVolatility = openingVolatility ? openingVolatility.volatility : null

    const closingVolatility = volatility.find((x) => t.abbrev === x.abbrev
      && new Date(t.closeDate).getHours() === new Date(x.date).getHours()
      && new Date(t.closeDate).getMinutes() === new Date(x.date).getMinutes()
    )
    t.closingVolatility = closingVolatility ? closingVolatility.volatility : null

    const tradePerformance = t.transactionType === 'short'
      ? service.abstractShortTradePerformance(t, relevantWMAData)
      : service.abstractLongTradePerformance(t, relevantWMAData)
    
    if (tradePerformance) tradePerformances.push({ ...t, ...tradePerformance })
  })

  return res.send(tradePerformances)
}