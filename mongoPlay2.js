const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stelitafx', {useNewUrlParser: true});



const TradeSchemaV2 = new mongoose.Schema({
  openRate: Number,
  date: Date,
  closeRate: Number,
  closeDate: Date,
  notes: String,
  closed: Boolean,
  viewed: Boolean
});
const Trade = mongoose.model('Trade', TradeSchemaV2)


const newTrade = {
  openRate: 1.11111,
  date: new Date(),
  closeRate: 1.11111,
  notes: 'I am a simple note',
  closed: true,
  viewed: false
}


const t = new Trade(newTrade);

t.save((e, r) => {
  if (e) return console.error(e)

  console.log('saved new trade model :)')
  console.log(r)
})


// Trade.find({}, 'openRate', function (e, x) {
//   console.log('find ???')
//   console.log(JSON.stringify(x))
// })


