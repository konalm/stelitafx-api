const config = require('@/config');
const db = require('@/dbInstance')
const getCurrencyPeriods = require('@/currencyRates/services/getCurrencyRates')
const calcAdx = require('./calcAdx')


module.exports = (interval) => new Promise((resolve, reject) => {
  const conn = db()

  const currencyStoreAdxPromises = []
  config.MAJOR_CURRENCIES.forEach((currency) => {
    const abbrev = `${currency}/${config.QUOTE_CURRENCY}`
    currencyStoreAdxPromises.push(storeAdxForAbbrev(interval, abbrev, conn))
  })

  Promise.all(currencyStoreAdxPromises)
    .then(() => {
      console.log('Stored ADX for all currencies')
      resolve()

    })
    .catch((e) => {
      console.log('Fail >>>')
      console.log(e)
      resolve()
    })
    .finally(() => {
      conn.end()
    })
})


const storeAdxForAbbrev = (interval, abbrev, conn) => 
  new Promise((resolve, reject) => 
{
  console.log(`store adx for abbrev .. ${abbrev}`)

  /* Get abbrev's last 150 periods */
  let periods 
  try {
    periods = await getCurrencyPeriods(interval, abbrev, 150)
  } catch (e) {
    console.log(e)
    return reject('Faled to get abbrev periods')
  }

  /* Order periods by earliest first */
  periods.sort((a, b) => new Date(a.date) - new Date(b.date))

  const adx = calcAdx(periods)

  console.log(`adx values for abbrev >>>`)
  console.log(adx)

  resolve(adx)
})