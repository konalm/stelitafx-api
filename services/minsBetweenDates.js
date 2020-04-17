module.exports = (aDateS, bDateS) => {
  const aDate = new Date(aDateS)
  const bDate = new Date(bDateS)
  const diffMs = bDate.getTime() - aDate.getTime() // milliseconds between dates
  
  return Math.round(diffMs / 60000)
}