const mongoose = require('mongoose')

const TradeSchema = require('./trade')

const intervalTradesSchema = {
  intOneTrades: [TradeSchema],
  intTwoTrades: [TradeSchema],
  intThreeTrades: [TradeSchema],
  intFiveTrades: [TradeSchema],
  intFifteenTrades: [TradeSchema],
  intThirtyTrades: [TradeSchema]
}

const PrototypeTradeSchema = new mongoose.Schema({
  number: Number,
  abbrevs: {
    GBP_USD: intervalTradesSchema,
    EUR_USD: intervalTradesSchema,
    AUD_USD: intervalTradesSchema
  }
})

module.exports = mongoose.model('PrototypeTrades', PrototypeTradeSchema)