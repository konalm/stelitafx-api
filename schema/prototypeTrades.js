const TradeSchema = require('./trade')

const intervalTradesSchema = {
  intOneTrades: [TradeSchema],
  intTwoTrades: [TradeSchema],
  intThreeTrades: [TradeSchema],
  intFourTrades: [TradeSchema]
}

const PrototypeTradeSchema = new mongoose.Schema({
  number: Number,
  abbrevs: {
    GBP_USD: intervalTradesSchema,
    EUR_USD: intervalTradesSchema,
    AUD_USD: intervalTradesSchema
  }
})

export default PrototypeTradeSchema