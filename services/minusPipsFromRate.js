module.exports = (rate, pips, currencyPair) => {
  const multiplier = !currencyPair.includes('JPY') ? 0.0001 : 0.01;

  return rate - (pips * multiplier)
}