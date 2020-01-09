const WebSocket = require('ws');

module.exports = () => new Promise((resolve, reject) => {
  const ws = new WebSocket('wss://ws.xtb.com/real');

  ws.on('open', async function open() {
    try {
      await login(ws)
    } catch (e) {
      console.log(e)
      return console.error('Failed to login')
    }

    let getPricesResponse
    try {
      getPricesResponse = await getPrices(ws)
    } catch (e) {
      return console.error('Failed to get prices')
    }

    try {
      await logout(ws)
    } catch (e) {
      return console.error('Failed to logout')
    }

    resolve(getPricesResponse.returnData.quotations) 
  })
})


/**
 * 
 */
const login = (ws) => new Promise((resolve, _) => {
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
const logout = (ws) => new Promise((resolve, _) => {
  const query = `{ "command": "logout" }`
  ws.send(query)
  ws.on('message', incoming = (dataS) => {
    resolve(dataS)
  })
})


/**
 * 
 */
const getPrices = (ws) => new Promise((resolve) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - 2)
  const timestamp = d.getTime()

  const query = `{
    "command": "getTickPrices",
    "arguments": {
      "level": 0,
      "symbols": ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY"],
      "timestamp": ${timestamp}
    }
  }`

  ws.send(query)
  ws.on('message', incoming = (dataS) => {
    const data = JSON.parse(dataS)
    resolve(data)
  })
})

