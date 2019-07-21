const conn = require('../db');

/**
 *
 */
const insertTrade = (transaction, abbrev, rate, algoProtoNo) => (abbrev, rate, algoProtoNo) =>
  new Promise((resolve, reject) =>
{
  const query = "INSERT INTO trade (abbrev, transaction, algo_proto_no, rate) VALUES ?";
  const queryValues = [
    [abbrev, transaction, algoProtoNo, rate]
  ];

  conn.query(query, [queryValues], function(err, result) {
    if (err) return reject(err);

    resolve(result);
  });
});
exports.insertBuyTrade = insertTrade('buy');
exports.insertSellTrade = insertTrade('sell');


/**
 *
 */
exports.getCurrencyTrades = (algoId, abbrev, dateTimeFilter) =>
  new Promise((resolve, reject) =>
{
  let query = `
    SELECT id, date, transaction, rate
    FROM trade
    WHERE algo_proto_no = ?
    AND abbrev = ?`;
  let queryValues = [algoId, abbrev];

  if (dateTimeFilter) {
    query += ` AND date >= ?`;
    queryValues.push(dateTimeFilter);
  }

  query += ` ORDER BY date DESC`;

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    resolve(results);
  });
});


/**
 *
 */
exports.getAlgoCurrencyTrade = (algoId, abbrev, tradeId) =>
  new Promise((resolve, reject) =>
{
  let query = `
    SELECT date, transaction, rate
    FROM trade
    WHERE algo_proto_no = ?
      AND abbrev = ?
      AND id = ?`;
  let queryValues = [algoId, abbrev, tradeId];

  conn.query(query, queryValues, (err, result) => {
    if (err) return reject(err);

    return resolve(result[0]);
  });
});


/**
 *
 */
exports.getTradeTransactions = (abbrev, buyTradeId, sellTradeId) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT date, transaction, rate
    FROM trade
    WHERE abbrev = ?
    AND (transaction = 'buy' AND id = ?)
      OR (transaction = 'sell' AND id = ?)
    ORDER BY date`;
  const queryValues = [abbrev, buyTradeId, sellTradeId];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);
    if (results.length < 2) return reject('unable to get both buy and sell trade');

    if (results[0].transaction !== 'buy') return reject('buy trade should be before sell trade');

    return resolve(results);
  });
});


/**
 *
 */
exports.getTrade = (abbrev, tradeId, transaction) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT date, rate, transaction
    FROM trade
    WHERE abbrev = ?
    AND transaction = ?
    AND id = ?`;
  const queryValues = [abbrev, transaction, tradeId];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    return resolve(results[0]);
  });
});


/**
 *
 */
exports.getProtoTrades = (protoNo) => new Promise((resolve, reject) => {
  const query = `
    SELECT abbrev, date, rate, transaction
    FROM trade
    WHERE algo_proto_no = ?`;
  const queryValues = [protoNo];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    resolve(results);
  });
});


/**
 *
 */
exports.getLastTrade = (protoNo, abbrev) => new Promise((resolve, reject) => {
  const query = `
    SELECT date, transaction, rate
    FROM trade
    WHERE algo_proto_no = ?
      AND abbrev = ?
    ORDER BY date DESC
    LIMIT 1`;
  const queryValues = [protoNo, abbrev];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    resolve(results[0]);
  });
});
