module.exports = (gran) => {
  let interval = parseInt(gran.substring(1, gran.length))
  const granSymbol = gran.substring(0, 1)
  if (granSymbol === 'H') interval = interval * 60

  return interval
}