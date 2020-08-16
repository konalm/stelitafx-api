exports.getLowestLow = (candles) => candles.reduce((a, b) => a.low < b.low ? a : b, 0).low 

exports.getHighestHigh = (candles) => candles.reduce((a, b) => a.high > b.high ? a : b, 0).high