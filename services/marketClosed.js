module.exports = () => {
  const d = new Date()
  const day = d.getDay() !== 0 ? d.getDay() : 7
  const hour = d.getHours()

  /* closed on friday after 22:00 */ 
  if (day === 5 && hour >= 22) return true 
  
  /*  closed on saturday */ 
  if (day === 6) return true

  /* closed on sunday before 22:00 */ 
  if (day === 7 && hour < 22) return true

  return false 
}