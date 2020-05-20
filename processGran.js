require('module-alias/register')
const wmaService = require('./wma/service')

const gran = process.argv.slice(2, 3)[0]



console.log('PROCESS GRAN')
console.log(gran)

Promise.all([
  wmaService.storeWMAData(gran, true)
])
  .then(() => {
    process.exit()
  })
  .catch(() => {
    console.log(`Failed to store WMA data for ${gran}`)
    process.exit()
  })


