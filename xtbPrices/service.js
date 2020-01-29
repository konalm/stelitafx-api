/**
 * 
 */
exports.login = (ws) => new Promise((resolve, _) => {
  const query = `{
    "command" : "login",
    "arguments" : {
      "userId" : "1525024",
      "password": "$$StellaLilly93"
    }
  }`

  ws.send(query,);
  ws.on('message',  incoming = (data) => resolve( JSON.parse(data) ))
})


/**
 * 
 */
exports.logout = (ws) => new Promise((resolve, _) => {
  const query = `{ "command": "logout" }`
  ws.send(query)
  ws.on('message', incoming = (dataS) => {
    resolve(dataS)
  })
})
