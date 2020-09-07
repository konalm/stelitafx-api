const { get } = require('@/services/oandaApiHttpRequest')
const symbolToInstrument = require('@/services/symbolToInstrument')

module.exports = async (gran, symbol, count) => {
  const instr = symbolToInstrument(symbol)
  const path = `instruments/${instr}/candles?granularity=${gran}&count=${count}`

  let response 
  try {
    response = await get(path)
  } catch (e) {
    throw new Error(e)
  }

  return response.candles
}