const conn = require('../db')
const mysql = require('mysql')
const db = require('../dbInstance')
const calculatePip = require('../services/calculatePip')
const calcOandaPipsFromTransactions = require('../services/calcOandaPipsFromTransactions')
const calcXTBPipsFromTransaction = require('../services/calcXTBPipsFromTransaction')
const formatMysqlDate = require('../services/formatMysqlDate')
const secondsBetweenDates = require('../services/secondsBetweenDates')
const service = require('./service')


exports.getTrades = (conditions, dateFilter) => new Promise(async (resolve, reject) => {
  const dbConn = db()
  let query = `
    SELECT
      t.id,
      t.abbrev,
      t.uuid,
      t.open_rate AS openRate,
      t.date AS openDate,
      t.close_rate AS closeRate,
      t.close_date AS closeDate,
      t.time_interval AS timeInterval,
      t.account,
      t.viewed,
      t.closed,
      t.proto_no AS prototypeNo,
      t.transaction_type AS transactionType,
      t.open_notes AS openNotes,
      t.close_notes AS closeNotes,
      
      t_xtb_rel.xtb_opentrade_id AS xtbOpenTradeId,
      t_xtb_rel.xtb_closetrade_id AS xtbCloseTradeId,
      xtb_trans_open.json AS openTradeTransactionJson,
      xtb_trans_close.json AS closeTradeTransactionJson,

      xtb_h_t.json AS xtb_historic_trade_json
      
    FROM tradeV2 t

    LEFT JOIN trade_xtbtrade_rel t_xtb_rel
      ON t_xtb_rel.trade_uuid = t.uuid
    LEFT JOIN xtb_trade_transactions xtb_trans_open
      ON xtb_trans_open.trade_id = t_xtb_rel.xtb_opentrade_id
    LEFT JOIN xtb_trade_transactions xtb_trans_close
      ON xtb_trans_close.trade_id = t_xtb_rel.xtb_closetrade_id
    LEFT JOIN xtb_historic_trade xtb_h_t
      ON xtb_h_t.order2_no = t_xtb_rel.xtb_closetrade_id
  `

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
    dbConn.end()

    if (err) {
      console.log('Failed to get trades')
      return reject(err)
    }

    results.forEach((r) => {
      r.pips = r.closed 
        ? r.transactionType !== 'short' 
          ? calculatePip(r.openRate, r.closeRate, conditions.abbrev) 
          : calculatePip(r.openRate, r.closeRate, conditions.abbrev)  * -1
        : null
  
      /* calculate XTB pips for trades executed on broker */ 
      if (r.xtbOpenTradeId && r.xtbCloseTradeId) {
        // r.xtbStats = service.xtbTransactionStats(r)
      
        // delete r.openTradeTransactionJson;
        // delete r.closeTradeTransactionJson;
        // delete r.openNotes;

        if (r.closeTradeTransactionJson) {
          // r.xtbPips = calcXTBPipsFromTransaction(r.openTradeTransactionJson, r.closeTradeTransactionJson)

          // const xtbCloseTransaction = JSON.parse(r.closeTradeTransactionJson)
          // if (xtbCloseTransaction.hasOwnProperty('state')) {
          //   r.xtbTradeState = xtbCloseTransaction.state
          //   r.xtbCloseTradeStatus = xtbCloseTransaction.status
          // }
        }
      }
    })

    resolve(results)
  })
})


exports.getNextTrade = (tradeUUID) => new Promise(async (resolve, reject) => {
  let trade;
  try {
    trade = await this.getTradeByUUID(tradeUUID);
  } catch (err) {
    return reject('Could not get trade');
  }

  console.log(trade)

  if (!trade) return reject(`Could not find trade with UUID: ${tradeUUID} `)  

  const query = `
    SELECT uuid FROM tradeV2
    WHERE proto_no = ?
      AND abbrev = ?
      AND close_date > ?
      AND closed = true
    ORDER BY date ASC
    LIMIT 1
  `
  const queryValues = [trade.proto_no, trade.abbrev, trade.closeDate];

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    return results.length > 0 ? resolve(results[0].uuid) : resolve();
  })
  dbConn.end()
})


exports.getPrevTrade = (tradeUUID) => new Promise(async (resolve, reject) => {
console.log('get prev trade')

 let trade;
 try {
   trade = await this.getTradeByUUID(tradeUUID);
  } catch (err) {
    return reject('Could not get trade');
  }

  const query = `
    SELECT uuid FROM tradeV2
    WHERE proto_no = ?
      AND abbrev = ?
      AND close_date < ?
      AND closed = true
    ORDER BY date DESC
    LIMIT 1`;
  const queryValues = [trade.proto_no, trade.abbrev, trade.closeDate];

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    dbConn.end()

    if (err) return reject(err);

    return results.length > 0 ? resolve(results[0].uuid) : resolve();
  })
})


exports.getTradeById = (id) => new Promise((resolve, reject) => {
  const dbConn = db()
  const query = `
    SELECT abbrev, proto_no, date, close_date AS closeDate
    FROM tradeV2
    WHERE id = ?
      AND closed = true
    LIMIT 1`;

  dbConn.query(query, [id], (err, results) => {
    if (err) return reject(err);

    return results ? resolve(results[0]) : resolve();
  })
  dbConn.end()
})


exports.getTradeByUUID = (UUID) => new Promise((resolve, reject) => {
  console.log('get trade by UUID')

  const dbConn = db()
  const query = `
    SELECT abbrev, proto_no, date, close_date AS closeDate
    FROM tradeV2
    WHERE uuid = ?
      AND closed = true
    LIMIT 1`;

  dbConn.query(query, [UUID], (err, results) => {
    dbConn.end()

    if (err) return reject(err);

    return results ? resolve(results[0]) : resolve();
  })
})


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

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject('Failed to trades for proto from DB')

    results.forEach((result) => {
      result.pip = calculatePip(result.openRate, result.closeRate, result.abbrev)
    })

    resolve(results)
  })
  dbConn.end()
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

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    results.forEach((result) => {
      result.pips = calculatePip(result.openRate, result.closeRate, abbrev);
    })

    resolve(results)
  })
  dbConn.end()
})


const insertTrade = (transaction, abbrev, rate, algoProtoNo) =>
  (abbrev, rate, algoProtoNo) =>
  new Promise((resolve, reject) =>
{
  const query = "INSERT INTO trade (abbrev, transaction, algo_proto_no, rate) VALUES ?";
  const queryValues = [
    [abbrev, transaction, algoProtoNo, rate]
  ];

  const dbConn = db()
  dbConn.query(query, [queryValues], function(err, result) {
    if (err) return reject(err);

    resolve(result);
  })
  dbConn.end()
})
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

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    resolve(results);
  })
  dbConn.end()
})


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

  const dbConn = db()
  dbConn.query(query, queryValues, (err, result) => {
    if (err) return reject(err);

    return resolve(result[0]);
  })
  dbConn.end()
})


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
    ORDER BY date
  `
  const queryValues = [abbrev, buyTradeId, sellTradeId];

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);
    if (results.length < 2) return reject('unable to get both buy and sell trade');

    if (results[0].transaction !== 'buy') return reject('buy trade should be before sell trade');

    return resolve(results);
  })
  dbConn.end()
})


exports.getTrade = (protoNo, abbrev, tradeId) => new Promise((resolve, reject) =>
{
  const query = `
    SELECT t.open_rate AS openRate,
      t.date AS openDate,
      t.close_rate AS closeRate,
      t.close_date AS closeDate,
      t.open_stats AS openStats,
      t.time_interval AS timeInterval,
      t.viewed,
      t.account

    FROM tradeV2 t
  
    WHERE t.proto_no = ?
    AND t.abbrev = ?
    AND t.uuid = ?
  `
  const queryValues = [protoNo, abbrev, tradeId]

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
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
      account: results[0].account,
      pips: calculatePip(results[0].openRate, results[0].closeRate, abbrev),
      openingVolatility: results[0].openingVolatility || null,
      closingVolatility: results[0].closingVolatility || null
    }

    return resolve(mappedResult);
  })
  dbConn.end()
})


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
      AND uuid = ?`;
  const queryValues = [abbrev, tradeId];

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject(err)

    return resolve(results[0])
  })
  dbConn.end()
});


exports.getProtoTrades = (protoNo) => new Promise((resolve, reject) => {
  const query = `
    SELECT abbrev, date, rate, transaction
    FROM trade
    WHERE algo_proto_no = ?
  `
  const queryValues = [protoNo]

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject(err)

    resolve(results);
  })
  dbConn.end()
})


exports.getLastTrade = (protoNo, timeInterval, abbrev, conn) => 
  new Promise((resolve, reject) =>
{
  const query = `
    SELECT id, date, open_rate, closed, uuid
    FROM tradeV2
    WHERE proto_no = ?
      AND abbrev = ?
      AND time_interval = ?
    ORDER BY date DESC
    LIMIT 1
  `
  const queryValues = [protoNo, abbrev, timeInterval];

  const dbConn = conn ? conn : db()
  dbConn.query(query, queryValues, (err, results) => {
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
  })
  dbConn.end()
})


exports.createTrade = (data, conn = db()) => new Promise((resolve, reject) => {
  if (!data) return;

  let query = "INSERT INTO tradeV2 SET ?";

  const dbConn = conn
  dbConn.query(query, data, (e, _) => {
    if (e) {
      console.log('FAILED TO CREATE TRADE')
      console.log(e)
      return reject(e);
    }

    resolve('created trade');
  })
  dbConn.end()
})


exports.createTradeOandaTradeRel = (tradeUUID, oandaTradeId) => 
  new Promise((resolve, reject) => 
{
  const data = {
    trade_uuid: tradeUUID,
    oanda_opentrade_id: oandaTradeId
  }
  let query = "INSERT INTO trade_oandatrade SET ?";

  const dbConn = db()
  dbConn.query(query, data, (e) => {
    if (e) {
      console.log('failed to create oanda trade relationship ??')
      return reject(e)
    }

    resolve('Created trade and Oanda trade relationship');
  })
  dbConn.end()
})


exports.updateTrade = (uuid, data) => new Promise((resolve, reject) => {
  if (!data) return;

  let query = 'UPDATE tradeV2 SET ? WHERE uuid = ?';

  const dbConn = db()
  dbConn.query(query, [data, uuid], (err) => {
    if (err) {
      console.log(err)
    
      return reject(err);
    }
    resolve('updated trade');
  })
  dbConn.end()
})


exports.getOandaTradeRel = (select, where) => new Promise((resolve, reject) => {
  if (!select) return 

  let query = `SELECT ${select.join()} FROM trade_oandatrade`;
  const queryValues = [];
  let i = 0
  for (let [k, v] of Object.entries(where)) {
    if (i === 0) query += ' WHERE'
    else query += ' AND'

    query += ` ${k} = ?`
    queryValues.push(v)
  }

  const dbConn = db()
  dbConn.query(query, queryValues, (err, results) => {
    if (err) return reject(err)

    if (results.length === 1) return resolve(results[0])
    resolve(results)
  })
  dbConn.end()
})

exports.getTradeJoinOandaTrade = (id) => new Promise((resolve, reject) => {
  const query = `
    SELECT oanda_opentrade_id AS oandaOpenTradeId,
      oanda_closetrade_id As oandaCloseTradeId
    FROM tradeV2
    INNER JOIN trade_oandatrade oandaTrade
      ON oandaTrade.trade_uuid = tradeV2.uuid
    WHERE tradeV2.id = ?
  `
  const dbConn = db()
  dbConn.query(query, [id], (e, results) => {
    if (e) return reject(e)

    resolve(results[0])
  })
  dbConn.end()
})

exports.updateOandaTradeRel = (data, uuid) => new Promise((resolve, reject) => {
  if (!data) return resolve()

  const query = "UPDATE trade_oandatrade SET ? WHERE trade_uuid = ?"
  
  const dbConn = db()
  dbConn.query(query, [data, uuid], (e) => {
    if (e) return reject(e)

    resolve('updated trade_oandatrade')
  })
  dbConn.end()
})


exports.getPrototypeAbbrevLatestTrades = (abbrev, interval) => 
  new Promise((resolve, reject) => 
{
  const query = `
    SELECT 
      t.id, 
      t.uuid,
      t.proto_no AS prototypeNo, 
      t.abbrev, 
      t.date, 
      t.closed, 
      t.open_rate AS openRate, 
      t.time_interval AS timeInterval
    FROM stelita.tradeV2 t
    INNER JOIN (
      SELECT proto_no, abbrev, MAX(date) date
      FROM stelita.tradeV2
      GROUP BY proto_no, abbrev
    ) b ON b.proto_no = t.proto_no AND b.abbrev = t.abbrev AND b.date = t.date 
    WHERE t.time_interval = ?
		AND t.abbrev = ?
    ORDER BY t.proto_no ASC;
  `
  const queryValues = [interval, abbrev]

  const dbConn = db()
  dbConn.query(query, queryValues, (e, results) => {
    if (e) return reject(e)

    resolve(results)
  })
  dbConn.end()
})


exports.updateTradesToClosed = (trades, abbrevRates) => 
  new Promise((resolve, reject) => 
{
  const closeDate = formatMysqlDate(new Date())
  const preparedTrades = trades.map((x) => ({
    id: x.id,
    data: {
      closed: true,
      close_rate:  abbrevRates.find(y => y.abbrev === x.abbrev).exchangeRate,
      close_date: closeDate,
    }
  }))

  let queries = ''
  preparedTrades.forEach((trade, i) => {
    queries += mysql.format('UPDATE tradeV2 SET ? WHERE id = ?; ', [trade.data, trade.id])
  })

  const dbConn = db()
  dbConn.query(queries, (e) => {
    if (e) {
      console.error(e)
      return reject()
    }

    resolve()
  })
  dbConn.end()
})


exports.getOandaTrades = (UUIDs) => new Promise((resolve, reject) => {
  const query = `
    SELECT ot.trade_uuid AS uuid,
      ot.oanda_opentrade_id AS oandaOpenTradeId,
      ot.oanda_closetrade_id AS oandaCloseTradeId,
      open_ott.json AS openTradeTransactionJson,
      close_ott.json AS closeTradeTransactionJson
    FROM trade_oandatrade ot

    LEFT JOIN oanda_trade_transactions open_ott
      ON open_ott.trade_id = ot.oanda_opentrade_id

    LEFT JOIN oanda_trade_transactions close_ott
      ON close_ott.trade_id = ot.oanda_closetrade_id
    
    WHERE ot.trade_uuid in (?)
  `
  const dbConn = db()
  dbConn.query(query, [UUIDs], (e, results) => {
    if (e) return reject(e)

    results.forEach((r) => {
      r.oandaPips = calcOandaPipsFromTransactions(
        r.openTradeTransactionJson, 
        r.closeTradeTransactionJson
      )

      const openTransaction = JSON.parse(r.openTradeTransactionJson)
      const bid = openTransaction.fullPrice.bids[0].price
      const ask = openTransaction.fullPrice.asks[0].price
      r.oandaBidAskSpread = calculatePip(bid, ask)
    })

    resolve(results)
  })
  dbConn.end()
})
