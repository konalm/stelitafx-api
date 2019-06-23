const conn = require('../db');

/**
 *
 */
const insertTrade = (abbrev, rate, algorithmId, transaction) =>
  (abbrev, rate, algorithm_id) =>
{
  const query = `INSERT INTO trade (abbrev, transaction, algorithm_id, rate,) VALUES ?`;
  const queryValues = [
    [abbrev, transaction, algorithm_id, rate]
  ];

  conn.query(query, queryValues, function(err, result) {
    if (err) throw new Error(err);
  });
}
exports.insertBuyTrade = insertTrade('buy');
exports.insertSellTrade = insertTrade('sell');


/**
 *
 */
exports.getCurrencyTrades = (algoId, abbrev) => new Promise((resolve, reject) => {
  console.log('get currency trades');

  const query =
    `SELECT date, transaction, rate
    FROM trade
    WHERE algorithm_id = ?
    AND abbrev = ?`;

  conn.query(query, [algoId, abbrev], (err, results) => {
    if (err) return reject(err);

    resolve(results);
  });
});
