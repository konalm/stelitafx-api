module.exports = (open, close, abbrev) => {
  const multiplier = abbrev !== 'JPY/USD'
    ? 0.0001
    : 0.000001;

  const pips = (close - open) / multiplier
  const pipS = pips.toFixed(2)

  return parseFloat(pipS)
}
