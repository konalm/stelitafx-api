const fs = require('fs');

module.exports = async (gran, abbrev, sinceDate, endDate) => {
  const allCandles = JSON.parse(
    await fs.readFileSync(`../../cache/historicCandles/${gran}/${abbrev}.JSON`, 'utf8')
  )
  
  return allCandles.filter((x) => new Date(x.date) >= new Date(sinceDate) &&
    new Date(x.date) < new Date(endDate)
  )
    .map((x) => ({
      date: new Date(x.date),
      open: parseFloat(x.candle.o),
      high: parseFloat(x.candle.h),
      low: parseFloat(x.candle.l),
      close: parseFloat(x.candle.c)
    }))
};