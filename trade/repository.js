const conn = require('../db');

/**
 *
 */
const insertTrade = (transaction, abbrev, rate, algoProtoNo) => (abbrev, rate, algoProtoNo) => {
  const query = "INSERT INTO trade (abbrev, transaction, algo_proto_no, rate) VALUES ?";
  const queryValues = [
    [abbrev, transaction, algoProtoNo, rate]
  ];

  conn.query(query, [queryValues], function(err, result) {
    if (err) throw new Error(err);
  });
}
exports.insertBuyTrade = insertTrade('buy');
exports.insertSellTrade = insertTrade('sell');


/**
 *
 */
exports.getCurrencyTrades = (algoId, abbrev, dateTimeFilter) =>
  new Promise((resolve, reject) =>
{
  console.log('get currency trades');
  console.log(`datetime filter >>> ${dateTimeFilter}`)

  let query = `
    SELECT id, date, transaction, rate
    FROM trade
    WHERE algo_proto_no = ?
    AND abbrev = ?`;
  let queryValues = [algoId, abbrev];

  if (dateTimeFilter) {
    console.log('have datetime filter ?????');
    query += ` AND date >= ?`;
    queryValues.push(dateTimeFilter);
  } else {
    console.log('HAVE NO datetime filter ????');
  }

  query += ` ORDER BY date DESC`;

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    resolve(results);
  });
});
