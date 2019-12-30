const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/stelitafx', {
  useNewUrlParser: true,
  useUnifiedTopology: true 
})


const TradeSchemaV2 = new mongoose.Schema({
  openRate: Number,
  date: Date,
  closeRate: Number,
  closeDate: Date,
  notes: String,
  closed: Boolean,
  viewed: Boolean
});

const intervalTradesSchema = {
  intOneTrades: [TradeSchemaV2],
  intTwoTrades: [TradeSchemaV2],
  intThreeTrades: [TradeSchemaV2],
  intFourTrades: [TradeSchemaV2]
}
const PrototypeTradeSchema = new mongoose.Schema({
  number: Number,
  abbrevs: {
    GBP_USD: intervalTradesSchema,
    EUR_USD: intervalTradesSchema,
    AUD_USD: intervalTradesSchema
  }
})


const newTrade = {
  openRate: 1.11111,
  date: new Date(),
  closeRate: 1.11111,
  notes: 'I am a simple note',
  closed: true,
  viewed: false
}

const PrototypeTrades = mongoose.model('PrototypeTrades', PrototypeTradeSchema)

const prototypeOneTrades = new PrototypeTrades({number: 1})

prototypeOneTrades.abbrevs.GBP_USD.intOneTrades.push(newTrade)
prototypeOneTrades.save((e, r) => {
  if (e) {
    console.log('error >>>>>>>>>>>>>>')
    console.log(e)
    console.log('<<<<<<<<<<<<<<<<<<<<<<')
    return 
  }

  console.log('saved prototype trades :)')
})


const f = async () => {
  console.log('UPDATE DOC FUNC')
  
  let doc
  try {
    doc = await PrototypeTrades.findOne({number: 1})
  } catch (e) {
    console.log('failed to find prototype trades')
  }

  doc.abbrevs.GBP_USD.intOneTrades.push(newTrade);

  try {
    await doc.save()
  } catch (e) {
    console.log(`Failed to save doc`)
    console.log(e)
  }
}
f()



