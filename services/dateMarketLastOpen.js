const marketClosed = require('./marketClosed')

module.exports = () => {
  if (!marketClosed()) return new Date()

  const d = new Date() 
  const day = d.getDay()
  const daysOver = day - 5

  d.setDate(d.getDate() - daysOver)
  d.setHours(22)
  d.setMinutes(0)
  d.setSeconds(0)

  return d
}