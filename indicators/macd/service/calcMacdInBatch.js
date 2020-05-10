const calcMacd = require('./calcMacd')


module.exports = (rates, index) => {
  const fastEma = 12
  const slowEma = 26
  const macdEma = 9
  const smoothing = 150 
  const length = slowEma + macdEma + smoothing 

  if (rates.length < length - 1) return null 

  const relevantRates = [...rates].splice(index - length, length)


  // console.log('RELEVANT RATES >>')
  // console.log(relevantRates)

  return calcMacd(relevantRates)
}