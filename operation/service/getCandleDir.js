module.exports = (candle) => {
  if (candle.close >= candle.open) return "up";
  return "down";
};
