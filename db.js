const mysql = require('mysql');
const config = require('./config.js');
const dbConf = config.DB;

const connection = mysql.createConnection({
  host: dbConf.host,
  port: dbConf.port,
  user: dbConf.user,
  password: dbConf.password,
  database: dbConf.database
});
connection.connect();


module.exports = connection;
