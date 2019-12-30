const mongoose = require('mongoose')


const TradeSchema = new mongoose.Schema({
  uuid: String,
  openRate: Number,
  date: Date,
  closeRate: {
    type: Number,
    require: false
  },
  closeDate: {
    type: Date,
    required: false
  },
  openNotes: {
    type: String,
    required: false
  },
  openStats: {
    type: String,
    required: false
  },
  closeNotes: {
    type: String,
    required: false
  },
  closed: Boolean,
  viewed: Boolean
})

module.exports = TradeSchema