const PrototypeTrades = require('../schema/prototypeTrades')
const calculatePip = require('../services/calculatePip')
const service = require('./service')
const secondsBetweenDates = require('../services/secondsBetweenDates')
const repo = require('./repository');


exports.createTrade = async (data) => {
  const prototypeNumber = data.proto_no

  let prototype
  try {
    prototype = await PrototypeTrades.findOne({number: prototypeNumber})
  } catch (e) {
    throw new Error('Failed attempt to find prototype trades')
  } 

  // /* no prototype with number? Create new prototype */
  if (!prototype) prototype = new PrototypeTrades({number: prototypeNumber})
  
  const abbrevInstrument = service.mapAbbrevUnderscore(data.abbrev)
  const intervalStringValue = service.mapIntervalToString(data.time_interval)

  const tradeModel = {
    uuid: data.uuid,
    openRate: data.open_rate,
    date: new Date(),
    openNotes: data.openNotes,
    openStats: data.stats,
    closed: false,
    viewed: false
  }

  prototype.abbrevs[abbrevInstrument][intervalStringValue].push(tradeModel)

  try {
    await prototype.save()
  } catch (e) {
    throw new Error(`Failed to save new trade for prototype ${prototypeNumber}`)
  }
}


exports.getLastTrade = async (prototypeNumber, abbrev, interval) => {
  const abbrevInstrument = service.mapAbbrevUnderscore(abbrev)
  const intervalStringValue = service.mapIntervalToString(interval)

  const s = new Date()

  let prototype
  try {
    prototype = await PrototypeTrades.findOne({number: prototypeNumber})
  } catch (e) {
    console.log(':L')
    throw new Error(`Failed attempt at getting prototype ${prototypeNumber}`)
  }
  if (!prototype) return 
  
  const trades = prototype.abbrevs[abbrevInstrument][intervalStringValue]
  if (trades.length === 0) return 
  
  return trades[trades.length - 1]
}


exports.closeTrade = async (prototypeNumber, abbrev, interval, rate, notes) => {
  let prototype
  try {
    prototype = await PrototypeTrades.findOne({ number: prototypeNumber })
  } catch (e) {
    throw new Error(`Attempt to get prototype trades failed`)
  }

  if (!prototype) throw new Error(`Could not find prototype ${prototypeNumber}`)

  const abbrevInstrument = service.mapAbbrevUnderscore(abbrev)
  const intervalStringValue = service.mapIntervalToString(interval)

  const trades = prototype.abbrevs[abbrevInstrument][intervalStringValue]
  if (trades.length === 0) throw new Error('No trades to close')

  const openingTrade = trades[trades.length - 1]
  if (openingTrade.closed) throw new Error('Last trade already closed')

  openingTrade.closeDate = new Date()
  openingTrade.closeRate = rate
  openingTrade.closeNotes = notes
  openingTrade.closed = true

  try {
    prototype.save()
  } catch (e) {
    throw new Error('Failed to update trade to closed')
  }
}


exports.getPrototypeIntervalTrades = async (
  prototypeNumber, 
  interval, 
  dateTimeFilter = null
) => {
  console.log('get prototype interval trades')

  let prototype
  try {
    prototype = await PrototypeTrades.findOne({ number: prototypeNumber }).lean()
  } catch (e) {
    throw new Error('Failed attempt to get prototype')
  }

  if (!prototype) throw new Error(`No prototype ${prototypeNumber} found`)

  const intervalStringValue = service.mapIntervalToString(interval)

  const trades = []
  const abbrevs = Object.keys(prototype.abbrevs)
  abbrevs.forEach((abbrev) => {
    if (abbrev === '$init') return 

    const abbrevIntervalTrades = prototype.abbrevs[abbrev][intervalStringValue];
    abbrevIntervalTrades.forEach((x) => {
      x.abbrev = service.mapAbbrevSlash(abbrev)
    })
    trades.push(...abbrevIntervalTrades)
  })

  trades.forEach((trade) => {
    trade.pips = calculatePip(trade.openRate, trade.closeRate, 'GBP/USD')
  })
  trades.sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  let closedTrades = trades.filter(x => x.closed)
  const tradeUUIDs = closedTrades.map(x => x.uuid)

  if (parseInt(prototypeNumber) === 14) {
    // console.log('GET oanda trades :)')
    let oandaTrades
    try {
      oandaTrades = await repo.getOandaTrades(tradeUUIDs)
    } catch (e) {
      throw new Error('Failed to get oanda trades')
    }

    closedTrades.forEach((trade) => {
      relatedOandaTrade = oandaTrades.find(x => x.uuid === trade.uuid)
      if (relatedOandaTrade) Object.assign(trade, relatedOandaTrade)
    })
  } else {
    // console.log('DO NOT get oanda trades :(')
  }

  if (dateTimeFilter) {
    closedTrades = closedTrades.filter(x => new Date(x.date) >= new Date(dateTimeFilter))
  }

  return closedTrades
}


exports.getPrototypeIntervalCurrencyTrades = async (
  prototypeNumber, interval, currency
) => {
  let prototype
  try {
    prototype = await PrototypeTrades.findOne({ number: prototypeNumber }).lean()
  } catch (e) {
    throw new Error('Failed attempt to get prototype')
  }

  if (!prototype) throw new Error(`No prototype ${prototypeNumber} found`)

  const intervalStringValue = service.mapIntervalToString(interval)

  const abbrev = `${currency}_USD`

  let trades = prototype.abbrevs[abbrev][intervalStringValue];
  trades.forEach((x) => { 
    x.abbrev = abbrev 
    x.pips = calculatePip(trade.openRate, trade.closeRate, 'GBP/USD')
  })
  trades.sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  const closedTrades = trades.filter(x => x.closed)
  const tradeUUIDs = closedTrades.map(x => x.uuid)

  let oandaTrades
  try {
    oandaTrades = await repo.getOandaTrades(tradeUUIDs)
  } catch (e) {
    throw new Error('Failed to get oanda trades')
  }

  closedTrades.forEach((trade) => {
    relatedOandaTrade = oandaTrades.find(x => x.uuid === trade.uuid)
    if (relatedOandaTrade) Object.assign(trade, relatedOandaTrade)
  })

  return closedTrades
}


exports.getPrototypeIntervalCurrencyTrade = async (
  prototypeNumber, 
  interval, 
  abbrev, 
  tradeUUID
) => {
  let prototype
  try {
    prototype = await PrototypeTrades.findOne({ number: prototypeNumber }).lean()
  } catch (e) {
    throw new Error('Failed attempt to get prototype')
  }

  if (!prototype) throw new Error(`No prototype ${prototypeNumber} found`)

  const intervalStringValue = service.mapIntervalToString(interval)
  const trades = prototype.abbrevs[abbrev][intervalStringValue];

  return trades.find(x => x.uuid === tradeUUID)
}


exports.getPrototypeOpenTrades = async (prototypeNumber) => {
  let prototype
  try {
    prototype = await PrototypeTrades.findOne({ number: prototypeNumber }).lean()
  }  catch (e) {
    throw new Error('Failed attempt to find prototype with numnbers')
  }

  if (!prototype) throw new Error(`Could not find prototype with number ${prototypeNumber}`)

  const trades = []

  const abbrevs = Object.keys(prototype.abbrevs)
  abbrevs.forEach((abbrev) => {
    if (abbrev === '$init') return

    const abbrevTrades = prototype.abbrevs[abbrev]

    const intervals = Object.keys(abbrevTrades)
    intervals.forEach((intervalKey) => {
      if (intervalKey === '$init') return 

      const abbrevIntervalTrades = abbrevTrades[intervalKey]
      abbrevIntervalTrades.forEach((x) => {
        x.timeInterval = service.mapStringToInterval(intervalKey)
        x.abbrev = service.mapAbbrevSlash(abbrev)
      })

      trades.push(...abbrevIntervalTrades)
    })
  })

  return trades.filter(x => !x.closed)
}