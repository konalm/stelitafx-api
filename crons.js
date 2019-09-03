const cron = require('node-cron')
const wmaService = require('./wma/service');
const prototypeIni = require('./algorithms/ini');
const config = require('./config')



const cronScheduleStoreWMA = (min) => {
  cron.schedule(`*/${min} * * * *`, async () => {
    try {
      await wmaService.storeWMAData(min)
    } catch (err) {
      throw new Error('Failed to store WMA Data points for 2mins time interval')
    }

    prototypeIni(min)
  })
}

config.TIME_INTERVALS.forEach((timeInterval) => {
  cronScheduleStoreWMA(timeInterval)
})


