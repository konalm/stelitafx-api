const mysql = require('mysql');
const env = require('./env.js');
const dbConf = env.DB;


const connection = mysql.createConnection({
  host: dbConf.host,
  user: dbConf.user,
  password: dbConf.password,
  database: dbConf.database
});

try {
  connection.connect();
} catch (err) {
  console.log(err)
}

module.exports = connection;
