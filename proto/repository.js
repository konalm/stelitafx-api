const conn = require('../db');

/**
 * Select all prototype from the DB
 */
exports.getProtos = new Promise((resolve, reject) => {
  const query = `
    SELECT prototype_no, date_created, description
    FROM algorithm`;

  conn.query(query, (err, results) => {
    console.log(err);
    if (err) return reject('Error getting algorithms');

    resolve(results);
  });
});

/**
 *
 */
exports.getProto = (id) => new Promise((resolve, reject) => {
  const query = `
    SELECT prototype_no, date_created, description
    FROM algorithm
    WHERE id = ?`;
  const queryValues = [id];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    resolve(results[0]);
  });
});
