module.exports = (open, close) => {
  const multiplier = 0.0001;

  const pips = Math.round((close - open) / multiplier)
  return parseInt(pips)
}
