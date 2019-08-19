module.exports = (open, close, abbrev) => {
  const multiplier = abbrev !== 'JPY/USD'
    ? 0.0001
    : 0.000001;

  const pips = Math.round((close - open) / multiplier)
  return parseInt(pips)
}
