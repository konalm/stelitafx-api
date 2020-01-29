const { login, logout } = require('./service')

exports.openTrade = async () => {
  const ws = new WebSocket('wss://ws.xtb.com/real');

  try {
    login(ws)
  } catch (e) {
    return console.log(`Failed to login: ${e}`)
  }

  const request = `{
    "command": "tradeTransaction",
    "arguements": {
      "volume": "100",
      "symbol": "EURUSD",
      "cmd": 0,
      "type": 0,
      "customComment": "Hey there :) ... will put UUID here",
    }
  }`
  

}