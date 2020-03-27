const mysql = require('mysql');
const env = require('./env.js');
const dbConf = env.DB;

module.exports = () => {
  // console.log('use DB conn ()')

  console.log('DB INSTANCE ??????')

  const conn = mysql.createConnection({
    host: dbConf.host,
    user: dbConf.user,
    password: dbConf.password,
    database: dbConf.database,
    port: dbConf.port,
    multipleStatements: true
  })

  conn.connect()

  return conn
}
