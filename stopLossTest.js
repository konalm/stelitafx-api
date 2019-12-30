const implementStopLosses = require('./algorithms/stopLoss')


/**
 * Mongo db connection
 */
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stelitafx', {useNewUrlParser: true});


console.log('TEST STOP LOSS IMPLEMENTATION')

implementStopLosses()
  .then(res => {
    console.log('GOOD')
    process.exit()
  })
  .catch(err => {
    console.log('CATCH')
  })