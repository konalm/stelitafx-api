const conn = require('../db');
const calculatePip = require('../services/calculatePip');


exports.getTrades = (conditions, dateFilter) => new Promise(async (resolve, reject) => {
  let query = `
    SELECT
      id,
      abbrev,
      open_rate AS openRate,
      date AS openDate,
      close_rate AS closeRate,
      close_date AS closeDate,
      open_notes AS openNotes,
      close_notes AS closeNotes,
      time_interval AS timeInterval,
      viewed
    FROM tradeV2`;

  let i = 0
  let queryValues = []
  for (const [key, value] of Object.entries(conditions)) {
    if (i === 0) query += ` WHERE ${key} = ?`
    else query += ` AND ${key} = ?`

    queryValues.push(value)
    i++
  }

  if (dateFilter) {
    if (!conditions) query += ' WHERE'
    else query += ' AND'

    query += ` close_date >= ?`
    queryValues.push(dateFilter)
  }

  query += ' ORDER BY close_date DESC'

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err)

    results.forEach((result) => {
      result.pips = calculatePip(result.openRate, result.closeRate, conditions.abbrev);
    })

    resolve(results)
  })
})


exports.getNextTrade = (tradeId) => new Promise(async (resolve, reject) => {
  let trade;
  try {
    trade = await this.getTradeById(tradeId);
  } catch (err) {
    return reject('Could not get trade');
  }

  const query = `
    SELECT id FROM tradeV2
    WHERE proto_no = ?
      AND abbrev = ?
      AND close_date > ?
      AND closed = true
    ORDER BY date ASC
    LIMIT 1`;
  const queryValues = [trade.proto_no, trade.abbrev, trade.closeDate];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    return results.length > 0 ? resolve(results[0].id) : resolve();
  })
})


exports.getPrevTrade = (tradeId) => new Promise(async (resolve, reject) => {
 let trade;
 try {
   trade = await this.getTradeById(tradeId);
  } catch (err) {
    return reject('Could not get trade');
  }

  const query = `
    SELECT id FROM tradeV2
    WHERE proto_no = ?
      AND abbrev = ?
      AND close_date < ?
      AND closed = true
    ORDER BY date DESC
    LIMIT 1`;
  const queryValues = [trade.proto_no, trade.abbrev, trade.closeDate];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    return results.length > 0 ? resolve(results[0].id) : resolve();
  })
})


exports.getTradeById = (id) => new Promise((resolve, reject) => {
  const query = `
    SELECT abbrev, proto_no, date, close_date AS closeDate
    FROM tradeV2
    WHERE id = ?
      AND closed = true
    LIMIT 1`;

  conn.query(query, [id], (err, results) => {
    if (err) return reject(err);

    return results ? resolve(results[0]) : resolve();
  });
});


exports.getTradesProto = (protoNo, dateFilter) =>
  new Promise((resolve, reject) =>
{
  const queryValues = [protoNo];
  let query = `
    SELECT id
      abbrev,
      open_rate AS openRate,
      date AS openDate,
      close_rate AS closeRate,
      close_date AS closeDate,
      open_notes AS openNotes,
      close_notes AS closeNotes,
      viewed
    FROM tradeV2
    WHERE proto_no = ?
    AND closed = true`

  if (dateFilter) {
    query += ' AND close_date >= ?'
    queryValues.push(dateFilter);
  }

  query += ` ORDER BY closeDate DESC`;

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject('Failed to trades for proto from DB')

    results.forEach((result) => {
      result.pip = calculatePip(result.openRate, result.closeRate, result.abbrev)
    })

    resolve(results)
  })
})


exports.getProtoCurrencyClosedTrades = (protoNo, abbrev, dateFilter) =>
  new Promise((resolve, reject) =>
{
  const queryValues = [protoNo, abbrev];
  let query = `
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
    AND closed = true`

  if (dateFilter) {
    query += ' AND close_date >= ?'
    queryValues.push(dateFilter);
  }

  query += ` ORDER BY closeDate DESC`;

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    results.forEach((result) => {
      result.pips = calculatePip(result.openRate, result.closeRate, abbrev);
    })

    resolve(results)
  });
});


const insertTrade = (transaction, abbrev, rate, algoProtoNo) =>
  (abbrev, rate, algoProtoNo) =>
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


exports.getTrade = (protoNo, abbrev, tradeId) => new Promise((resolve, reject) =>
{
  const query = `
    SELECT open_rate AS openRate,
    date AS openDate,
    close_rate AS closeRate,
    close_date AS closeDate,
    open_stats AS openStats,
    time_interval AS timeInterval,
    viewed
    FROM tradeV2
    WHERE proto_no = ?
    AND abbrev = ?
    AND id = ?`;
  const queryValues = [protoNo, abbrev, tradeId];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);
    if (results.length === 0) return resolve()

    const mappedResult = {
      openRate: results[0].openRate,
      openDate: results[0].openDate,
      closeRate: results[0].closeRate,
      closeDate: results[0].closeDate,
      openStats: results[0].openStats,
      timeInterval: results[0].timeInterval,
      viewed: !results[0].viewed ? false : true,
      pips: calculatePip(results[0].openRate, results[0].closeRate, abbrev)
    }

    return resolve(mappedResult);
  });
});


exports.getTradeV2 = (abbrev, tradeId) => new Promise((resolve, reject) => {
  const query = `
    SELECT open_rate AS openRate,
      date AS openDate,
      close_rate AS closeRate,
      close_date AS closeDate,
      time_interval AS timeInterval,
      closed
    FROM tradeV2
    WHERE abbrev = ?
      AND id = ?`;
  const queryValues = [abbrev, tradeId];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err)

    return resolve(results[0])
  });
});


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


exports.getLastTrade = (protoNo, timeInterval, abbrev) =>
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT id, date, open_rate, closed, uuid
    FROM tradeV2
    WHERE proto_no = ?
      AND abbrev = ?
      AND time_interval = ?
    ORDER BY date DESC
    LIMIT 1`;
  const queryValues = [protoNo, abbrev, timeInterval];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    if (!results || results.length === 0) return resolve();

    const mappedResult = {
      id: results[0].id,
      openRate: results[0].open_rate,
      openDate: results[0].date,
      closed: results[0].closed,
      uuid: results[0].uuid
    };

    resolve(mappedResult);
  });
});


exports.createTrade = (data) => new Promise((resolve, reject) => {
  if (!data) return;

  let query = "INSERT INTO tradeV2 SET ?";
  conn.query(query, data, (err, results) => {
    if (err) return reject(err);

    resolve('created trade');
  });
});


exports.createTradeOandaTradeRel = (tradeUUID, oandaTradeId) => 
  new Promise((resolve, reject) => 
{
  const data = {
    trade_uuid: tradeUUID,
    oanda_opentrade_id: oandaTradeId
  }
  let query = "INSERT INTO trade_oandatrade SET ?";
  conn.query(query, data, (e) => {
    if (e) return reject(e)

    resolve('Created trade and Oanda trade relationship');
  });
});


exports.updateTrade = (id, data) => new Promise((resolve, reject) => {
  if (!data) return;

  let query = 'UPDATE tradeV2 SET ? WHERE id = ?';

  conn.query(query, [data, id], (err, result) => {
    if (err) return reject(err);

    resolve('updated trade');
  })
})

exports.getOandaTradeRel = (select, where) => new Promise((resolve, reject) => {
  if (!select) return 

  let query = `SELECT ${select.join()} FROM trade_oandatrade`;
  const queryValues = [];
  let i=0
  for (let [k, v] of Object.entries(where)) {
    if (i === 0) query += ' WHERE'
    else query += ' AND'

    query += ` ${k} = ?`
    queryValues.push(v)
  }

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err)

    if (results.length === 1) return resolve(results[0])

    resolve(results)
  })
})

exports.getTradeJoinOandaTrade = (id) => new Promise((resolve, reject) => {
  const query = `
    SELECT oanda_opentrade_id AS oandaOpenTradeId,
      oanda_closetrade_id As oandaCloseTradeId
    FROM tradeV2
    INNER JOIN trade_oandatrade oandaTrade
      ON oandaTrade.trade_uuid = tradeV2.uuid
    WHERE tradeV2.id = ?`
  
  conn.query(query, [id], (e, results) => {
    if (e) return reject(e)

    resolve(results[0])
  })
})

exports.updateOandaTradeRel = (data, uuid) => new Promise((resolve, reject) => {
  if (!data) return resolve()

  const query = "UPDATE trade_oandatrade SET ? WHERE trade_uuid = ?"
  
  conn.query(query, [data, uuid], (e) => {
    if (e) return reject(e)

    resolve('updated trade_oandatrade')
  })
})
