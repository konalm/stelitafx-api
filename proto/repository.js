const conn = require('../db');

/**
 * Select all prototypes from the DB
 */
exports.getProtos = new Promise((resolve, reject) => {
  const query = `
    SELECT prototype_no, date_created, description
    FROM algorithm`;

  conn.query(query, (err, results) => {
    console.log(err)
    if (err) return reject('Error getting algorithms');

    resolve(results);
  });
});


/**
 *
 */
exports.getProto = (protoNo) => new Promise((resolve, reject) => {
  const query = `
    SELECT prototype_no, date_created, description
    FROM algorithm
    WHERE prototype_no = ?`;
  const queryValues = [protoNo];

  conn.query(query, queryValues, (err, results) => {
    if (err) return reject(err);

    resolve(results[0]);
  });
});
