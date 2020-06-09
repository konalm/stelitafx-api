module.exports = (open, close, abbrev) => {
  const multiplier = !abbrev.includes('JPY')
    ? 0.0001
    : 0.01;
  const pips = (close - open) / multiplier
  const pipS = pips.toFixed(2)

  return parseFloat(pipS)
}
