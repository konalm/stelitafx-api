const mysql = require('mysql');
const env = require('./env.js');
const dbConf = env.DB;

module.exports = () => {
  const conn = mysql.createConnection({
    host: dbConf.host,
    user: dbConf.user,
    password: dbConf.password,
    database: 'statistics',
    port: dbConf.port,
    multipleStatements: true
  })

  conn.connect()

  return conn
}
