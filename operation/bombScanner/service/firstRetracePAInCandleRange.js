module.exports = (PA, candles, trend) => {
  /* highest high */
  const high = Math.max(...candles.map((x) => x.high));

  /* lowest low */
  const low = Math.min(...candles.map((x) => x.low));

  if (trend === "down") return PA.high < high;
  else return PA.low > low;
};
