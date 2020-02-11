const env = require('../env.js')

exports.login = (ws) => new Promise((resolve, _) => {
  const query = `{
    "command" : "login",
    "arguments" : {
      "userId" : "${env.XTB_USER_ID}",
      "password": "${env.XTB_PASSWORD}"
    }
  }`

  ws.send(query,);
  ws.on('message',  incoming = (data) => {
    resolve( JSON.parse(data) )
  })
})


exports.logout = (ws) => new Promise((resolve, _) => {
  const query = `{ "command": "logout" }`
  ws.send(query)
  ws.on('message', incoming = (dataS) => {
    resolve(dataS)
  })
})


exports.openTradeTransaction = (ws, symbol, price, cmd) => new Promise((resolve, reject) => {
  const request = `{
    "command": "tradeTransaction",
    "arguments" : {
      "tradeTransInfo": {
        "cmd": ${cmd},
        "type": 0,
        "price": ${price},
        "sl": 0.0,
        "tp": 0.0,
        "symbol": "${symbol}",
        "volume": 0.02,
        "order": 0,
        "customComment": "Some text",
        "expiration": 0
      }
    }
  }`

  console.log('request >>')
  console.log(request)

  ws.send(request)
  ws.on('message', incoming = (dataS) => {
    resolve(JSON.parse(dataS))
  })
})


exports.getTradeStatus = (ws, transactionNo) => new Promise((resolve, reject) => {
  const request = `{
    "command": "tradeTransactionStatus",
    "arguments": {
      "order": ${transactionNo}
    }
  }`

  ws.send(request)
  ws.on('message', incoming = (dataS) => {
    const data = JSON.parse(dataS)
    if (data.hasOwnProperty('returnData')) resolve(data.returnData)
    else resolve(null)
  })
})


exports.getOpenTrades = (ws) => new Promise((resolve, reject) => {
  const request = `{
    "command": "getTrades",
	  "arguments": {
		  "openedOnly": true
	  }
  }`

  ws.send(request)
  ws.on('message', incoming = (dataS) => { resolve(JSON.parse(dataS)) })
}) 


exports.closeTradeTransaction = (ws, trade) => new Promise((resolve, reject) => {
  // console.log('close trade transaction >>>>')
  // console.log(trade)

  const closePrice = trade.close_price > 0 ? trade.close_price : trade.open_price

  const request = `{
    "command": "tradeTransaction",
    "arguments" : {
      "tradeTransInfo": {
        "cmd": ${trade.cmd},
        "type": 2,
        "price": ${closePrice},
        "sl": ${trade.sl},
        "tp": ${trade.tp},
        "symbol": "${trade.symbol}",
        "volume": ${trade.volume},
        "order": ${trade.order},
        "customComment": "${trade.customComment}",
        "expiration": 0
      }
    }
  }`

  ws.send(request)
  ws.on('message', incoming = (dataS) => { resolve(JSON.parse(dataS)) })
})


exports.getPrices = (ws) => new Promise((resolve) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - 2)
  const timestamp = d.getTime()

  const query = `{
    "command": "getTickPrices",
    "arguments": {
      "level": 0,
      "symbols": ["EURUSD", "GBPUSD", "AUDUSD"],
      "timestamp": ${timestamp}
    }
  }`

  ws.send(query)
  ws.on('message', incoming = (dataS) => {
    const data = JSON.parse(dataS)

    let rates 
    if (
      data.hasOwnProperty('returnData') 
      && data.returnData.hasOwnProperty('quotations')
    ) rates = data.returnData.quotations
    else return resolve()

    resolve(rates)
  })
})

exports.getAbbrevPrice = (ws, abbrev) => new Promise((resolve) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - 2)
  const timestamp = d.getTime()

  const symbol = abbrev.replace("/", "")
  const query = `{
    "command": "getTickPrices",
    "arguments": {
      "level": 0,
      "symbols": ["${symbol}"],
      "timestamp": ${timestamp}
    }
  }`

  ws.send(query)
  ws.on('message', incoming = (dataS) => {
    const data = JSON.parse(dataS)

    let rates 
    if (
      data.hasOwnProperty('returnData') 
      && data.returnData.hasOwnProperty('quotations')
    ) rates = data.returnData.quotations
    else return resolve()
  
    resolve(rates[0])
  })
})


exports.getTradesHistory = (ws) => new Promise((resolve, reject) => {
  const request = `{
    "command": "getTradesHistory",
    "arguments": {
      "end": 0,
      "start": 0
    }
  }`

  ws.send(request)
  ws.on('message', incoming = (dataS) => {
    const data = JSON.parse(dataS)

    resolve(data.returnData)
  })
})