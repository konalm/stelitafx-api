const conn = require('./db');


module.exports = () => new Promise((resolve, reject) =>  {
  const query = 'show processlist;'

  conn.query(query, (e, results) => {
    if (e) {
      console.log('connection failed')
      console.log(e)
    }

    killAllConnections(results)
      .then(() => {
        // console.log('KILLED ALL CONNECTIONS')
        resolve()
      })
      .catch(() => {
        console.log('FAILED TO KILL CONNS')
        resolve()
      })
  })


  const killAllConnections = (connections) => new Promise(async(resolve, _) => {
    for (let i=0; i < connections.length; i++) {
      const connection = connections[i]

      if (connection.User !== 'connor' || connection.Command !== 'Sleep') continue;

      console.log('connection is connection with sleep command !!')

      const id = connections[i].Id;

      try {
        await killConnection(id)
      } catch (e) {
        console.log(`Failed to kill connection: ${id}`)
      }
    }

    resolve()
  })


  const killConnection = (connId) => new Promise((resolve, reject) => {
    const query = `kill ${connId}`
    conn.query(query, (e) => {
      if (e) return reject(e)

      resolve()
    })
  })
})
