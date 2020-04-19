const conn = require('../db')
const db = require('../dbInstance')

/**
 * Select all prototypes from the DB
 */
exports.getProtos = new Promise((resolve, reject) => {
  const dbConn = db()
  const query = `
    SELECT prototype_no, date_created, description
    FROM algorithm
  `
  dbConn.query(query, (err, results) => {
    dbConn.end()
    if (err) return reject('Error getting algorithms');

    resolve(results);
  })
})


/**
 *
 */
exports.getProto = (protoNo) => new Promise((resolve, reject) => {
  const dbConn = db()
  const query = `
    SELECT prototype_no, date_created, description
    FROM algorithm
    WHERE prototype_no = ?
  `
  const queryValues = [protoNo];

  dbConn.query(query, queryValues, (err, results) => {
    dbConn.end()
    if (err) return reject(err);

    resolve(results[0]);
  })
})


exports.getProtoById = (id) => new Promise((resolve, reject) => {
  const dbConn = db()
  const query = `
    SELECT prototype_no protoNo, date_created dateCreated, description
    FROM algorithm
    WHERE id = ?
  `
  const queryValues = [id];

  dbConn.query(query, queryValues, (err, results) => {
    dbConn.end()
    if (err) return reject(err);
    
    resolve(results[0]);
  })
})