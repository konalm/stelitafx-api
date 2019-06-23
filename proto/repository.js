const conn = require('../db');

/**
 *
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
