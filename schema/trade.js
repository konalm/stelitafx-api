const TradeSchema = new mongoose.Schema({
  openRate: Number,
  date: Date,
  closeRate: Number,
  closeDate: Date,
  notes: String,
  closed: Boolean,
  viewed: Boolean
})

export default TradeSchema