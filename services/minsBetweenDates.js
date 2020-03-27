module.exports = (aDateS, bDateS) => {
  const aDate = new Date(aDateS)
  const bDate = new Date(bDateS)

  const diffMs = (bDate - aDate); // milliseconds between dates
  
  return Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
}