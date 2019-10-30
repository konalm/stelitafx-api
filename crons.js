const cron = require('node-cron')
const wmaService = require('./wma/service');
const prototypeIni = require('./algorithms/ini');
const config = require('./config')
const insertCurrencyRates = require('./updateCurrencyRates/insertCurrencyRates');
const currencyRateSource = [
  'currency_rate',
  'fixerio_currency_rate'
]

const x = async () => {
  try {
    await Promise.all([
      wmaService.storeWMAData(1, 'currency_rate'),
      wmaService.storeWMAData(1, 'fixerio_currency_rate')
    ])
  } catch (e) {
    console.log(e)
    throw new Error(`Failed to store WMA Data points for ${min}mins time interval`)
  }
}
// x()


/**
 * 
 */
cron.schedule('* * * * *', async () => {
  console.log('CRON')

  try {
    await insertCurrencyRates();
  } catch (err) {
    throw new Error('Error inserting currency rates');
  }

  const d = new Date()
  const min = d.getMinutes()


  config.TIME_INTERVALS.forEach((timeInterval) => {
    if (min % timeInterval === 0) cronSchedule(timeInterval)
  })
});


const cronSchedule = async (min) => {
  console.log(`cron schedule for ${min}`)
  
  try {
    await Promise.all([
      wmaService.storeWMAData(min, 'currency_rate'),
      wmaService.storeWMAData(min, 'fixerio_currency_rate')
    ])
  } catch (e) {
    console.log(e)
    throw new Error(`Failed to store WMA Data points for ${min}mins time interval`)
  }

  /* make trades for each currency rate source */
  currencyRateSource.forEach((source) => {
    prototypeIni(min, source)
  })
}




// const cronSchedule = (min) => {
//   cron.schedule(`*/${min} * * * *`, async () => {
//     console.log(`store wma data for min ${min}`)

//     try {
//       await Promise.all([
//         wmaService.storeWMAData(min, 'currency_rate'),
//         wmaService.storeWMAData(min, 'fixerio_currency_rate')
//       ])
//     } catch (e) {
//       console.log(e)
//       throw new Error(`Failed to store WMA Data points for ${min}mins time interval`)
//     }

//     /* make trades for each currency rate source */
//     currencyRateSource.forEach((source) => {
//       prototypeIni(min, source)
//     })
//   })
// }

// config.TIME_INTERVALS.forEach((timeInterval) => {
//   cronSchedule(timeInterval)
// })
