require('module-alias/register');

const fs = require('fs');
const getCandles = require('@/candle/service/getCandles');
const { fetchCandles } = require('@/services/bitfinex')
const config = require('@/config');
const CURRENCYPAIRS = config.CURRENCYPAIRS;
const CRYPTO_CURRENCYPAIRS = config.CRYPTO_CURRENCYPAIRS;
const GRAN = 'H1';
const crypto = true


const getRates = async (currencyPair) => {
  const candles = await getCandles(GRAN, currencyPair, 1000)

  return candles.map((x) => ({
    date: x.time,
    bid: parseFloat(x.mid.c),
    ask: parseFloat(x.mid.c),
    close: parseFloat(x.mid.c),
    open: parseFloat(x.mid.o),
    low: parseFloat(x.mid.l),
    high: parseFloat(x.mid.h),
  }))
}

const getCryptoRates = async (currencyPair) => {
  const candles = await fetchCandles(currencyPair, GRAN, null, 1000)

  return candles.map((x) => ({
    date: x.date,
    bid: x.c,
    ask: x.c,
    close: x.c,
    open: x.o,
    low: x.l,
    high: x.h
  }))
}

const cacheCurrencyPair = (currencyPair) => new Promise(async (resolve, reject) => {
  console.log(`cache currency pair ... ${currencyPair}`)

  let rates 
  if (!crypto) rates = await getRates(currencyPair)
  if (crypto) rates = await getCryptoRates(currencyPair)

  console.log(`crypto ... ${crypto}`)
  console.log(`rates ... ${rates.length}`)

  try {
    await fs.writeFileSync(
      `../cache/currencyRate/${GRAN}/${currencyPair}.JSON`, JSON.stringify(rates)
    )
  } catch (e) {
    console.log(`Failed to write cache ${e}`)
  }

  resolve()
});


(async () => {
  console.log('OPERATION CACHE RATES')

  const cacheCurrencyPairPromises = []
  CRYPTO_CURRENCYPAIRS.forEach((currencyPair) => {
    cacheCurrencyPairPromises.push(cacheCurrencyPair(currencyPair))
  })

  Promise.all(cacheCurrencyPairPromises)
    .then(() => {
      process.exit()
    })
    .catch((e) => {
      console.error(e)
      process.exit()
    })
})();