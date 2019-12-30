module.exports = (startDate) => {
  const endDate = new Date()
  const diff = endDate.getTime() - startDate.getTime()
  return diff / 1000
}