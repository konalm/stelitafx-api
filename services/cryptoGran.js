module.exports = (gran) => {
  const granSymbol = gran.substring(0, 1)
  const interval = gran.substring(1, gran.length)

  return `${interval}${granSymbol.toLowerCase()}`
}