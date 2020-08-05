module.exports = (periods) => {
  return periods.map((x) => ({
    date: x.date,
    open: parseFloat(x.candle.o),
    close: parseFloat(x.candle.c),
    high: parseFloat(x.candle.h),
    low: parseFloat(x.candle.l)
  }))
}