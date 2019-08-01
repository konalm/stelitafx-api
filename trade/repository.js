const conn = require('../db');
const calculatePip = require('../services/calculatePip');

/**
 *
 */
exports.getProtoCurrencyClosedTrades = (protoNo, abbrev) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT id,
      open_rate AS openRate,
      date AS openDate,
      close_rate AS closeRate,
      close_date AS closeDate,
      open_notes AS openNotes,
      close_notes AS closeNotes,
      viewed
    FROM tradeV2
    WHERE proto_no = ?
    AND abbrev = ?
    AND closed = true
    ORDER BY closeDate DESC`;
  const queryValues = [protoNo, abbrev];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    results.forEach((result) => {
      result.pips = calculatePip(result.openRate, result.closeRate, abbrev);
    })

    resolve(results)
  });
});


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
exports.getTrade = (protoNo, abbrev, tradeId) => new Promise((resolve, reject) =>
{
  const query = `
    SELECT open_rate AS openRate,
    date AS openDate,
    close_rate AS closeRate,
    close_date AS closeDate,
    viewed
    FROM tradeV2
    WHERE proto_no = ?
    AND abbrev = ?
    AND id = ?`;
  const queryValues = [protoNo, abbrev, tradeId];

  conn.query(query, queryValues, (err, results) => {
    console.log(err)
    if (err) return reject(err);

    if (!results) return resolve()

    results[0].pips = calculatePip(results[0].openRate, results[0].closeRate, abbrev)

    return resolve(results[0]);
  });
});


/**
 *
 */
exports.getTradeV2 = (abbrev, tradeId) => new Promise((resolve, reject) => {
  const query = `
    SELECT open_rate AS openRate,
      date AS openDate,
      close_rate AS closeRate,
      close_date AS closeDate,
      closed
    FROM tradeV2
    WHERE abbrev = ?
      AND id = ?`;
  const queryValues = [abbrev, tradeId];

  console.log(queryValues)

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err)

    console.log(results)
    return resolve(results[0])
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
    SELECT id, date, open_rate, closed
    FROM tradeV2
    WHERE proto_no = ?
      AND abbrev = ?
    ORDER BY date DESC
    LIMIT 1`;
  const queryValues = [protoNo, abbrev];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    if (!results || results.length === 0) return resolve();

    const mappedResult = {
      id: results[0].id,
      openRate: results[0].open_rate,
      closed: results[0].closed
    };

    resolve(mappedResult);
  });
});

/**
 *
 */
exports.createTrade = (data) => new Promise((resolve, reject) => {
  if (!data) return;

  let query = "INSERT INTO tradeV2 SET ?";
  conn.query(query, data, (err, results) => {
    if (err) return reject(err);

    resolve('created trade');
  });
});

/**
 *
 */
exports.updateTrade = (id, data) => new Promise((resolve, reject) => {
  if (!data) return;

  let query = 'UPDATE tradeV2 SET ? WHERE id = ?';

  conn.query(query, [data, id], (err, result) => {
    if (err) return reject(err);

    resolve('updated trade');
  })
})
