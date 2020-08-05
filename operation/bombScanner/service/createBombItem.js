module.exports = (item, candle) => {
  return {
    ...item,
    date: {
      start: item.impulseWave.date.start,
      end: candle.date
    },
  }
}