module.exports = (startDate, endDate) => {
  const diff = endDate.getTime() - startDate.getTime()
  
  return (diff / 1000) / 60
}