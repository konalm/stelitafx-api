const mysql = require('mysql');
const env = require('./env.js');
const dbConf = env.DB;


const connection = mysql.createConnection({
  host: dbConf.host,
  user: dbConf.user,
  password: dbConf.password,
  database: dbConf.database
});

// const connection = mysql.createConnection({
//   host: '138.68.167.173',
//   user: 'connor',
//   password: '$$superstar',
//   database: 'stelitafx'
// })

try {
  connection.connect();
} catch (err) {
  console.log('COULD NOT CONNECT TO DB')
  console.error(err)
}

module.exports = connection;
