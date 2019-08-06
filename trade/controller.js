const repo = require('./repository.js');

/**
 *
 */
exports.getPrevTrade = async (req, res) => {
  const tradeId = req.params.tradeId;

  let prevTrade;
  try {
    prevTrade = await repo.getPrevTrade(tradeId);
  } catch (err) {
    return res.status(500).send('Unable to get prev trade');
  }

  if (!prevTrade) return res.status(404).send('prev trade not found')

  return res.send({tradeId: prevTrade});
}

/**
 *
 */
exports.getNextTrade = async (req, res) => {
  const tradeId = req.params.tradeId;

  let nextTrade;
  try {
    nextTrade = await repo.getNextTrade(tradeId);
  } catch (err) {
    return res.status(500).send('Unable to get next trade');
  }

  return res.send({tradeId: nextTrade});
}

/**
 *
 */
exports.getTrade = async (req, res) => {
  const tradeId = req.params.tradeId;
  const protoNo = req.params.protoNo;
  const abbrev = `${req.params.currency}/USD`

  let trade;
  try {
    trade = await repo.getTrade(protoNo, abbrev, tradeId);
  } catch (err) {
    return res.status(500).send('Failed to get trade');
  }

  if (!trade) return res.status(404).send('Trade not found');

  return res.send(trade)
}

/**
 *
 */
exports.getProtoCurrencyClosedTrades = async (req, res) => {
  console.log('get proto currency close trades !!');

  const protoNo = req.params.proto_no;
  const baseCurrency = req.params.currency;
  const abbrev = `${baseCurrency}/USD`;
  const dateTimeFilter = req.query.date || '';

  let trades;
  try {
    trades = await repo.getProtoCurrencyClosedTrades(protoNo, abbrev, dateTimeFilter);
  } catch (err) {
    console.log(err);
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
  console.log('get proto currency trades !!');

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


/**
 * Get all of proto's trades
 */
exports.getProtoTrades = async (req, res) => {
  const protoNo = req.params.proto_no;

  let trades;
  try {
    trades = await repo.getProtoTrades(protoNo);
  } catch (err) {
    return res.status(500).send('Error getting protos trades');
  }

  return res.send(trades);
}
