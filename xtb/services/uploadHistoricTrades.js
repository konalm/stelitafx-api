const { getTradeHistory } = require('../service')
const repo = require('../repository')


module.exports = () => new Promise(async (resolve, reject) => {
  console.log('upload historic trades')

  let tradeHistory 
  try {
    tradeHistory = await getTradeHistory()
  } catch (e) {
    console.log(e)
    return reject('Failed to get trade history from XTB')
  }

  let storedHistoricTrades
  try {
    storedHistoricTrades = await repo.getHistoricTrades()
  } catch (e) {
    return reject('Failed to get xtb historic trades stored in MYSQL')
  }

  const tradesNotStored = tradeHistory.filter((x) => 
    storedHistoricTrades.filter((y) => y.order2No === x.order2).length === 0
  )

  console.log('trades not stored >>')
  console.log(tradesNotStored.length)

  if (tradesNotStored.length === 0) return resolve()

  try {
    await repo.storeHistoricTrades(tradesNotStored)
  } catch (e) {
    console.log(e)
    return reject('Failed to store historic trades')
  }

  resolve()
})

