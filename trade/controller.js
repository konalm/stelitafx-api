const repo = require('./repository.js');

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
