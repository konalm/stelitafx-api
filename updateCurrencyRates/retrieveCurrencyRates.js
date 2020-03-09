const axios = require('axios');
const config = require('../config');
const env = require('../env.js');
const oandaFXAccountHttp = require('../services/oandaFXAccountHttpRequest')

const ACCOUNTID = env.OANDA_LIVE_ACCOUNT_ID;


/**
 *
 */
const fetchRates = async (url, params) => {
  let response;
  try {
    response = await axios.get(url, params);
  } catch (err) {
    throw new Error('Getting exchanges rates')
  }

  return response.data;
}

/**
 * Get latest currency rates from the Exchange Rates API quoted against the USD
 */
exports.exchangeRatesAPI = async () => {
  const url = 'https://api.exchangeratesapi.io/latest';
  const params = { params: {
    base: config.QUOTE_CURRENCY,
    symbols: config.MAJOR_CURRENCIES.join()
  }};
  const apiResponse = await fetchRates(url, params);

  return apiResponse.rates;
}

/**
 * Get latest currency rates from the Fixer API quoted against the USD
 */
exports.fixerAPI = async () => {
  const url = 'https://data.fixer.io/api/latest';
  const queryOptions = {
    params:  {
      access_key: 'ec800379c64d2160d7fb2fa26baa9d6a',
      base: config.QUOTE_CURRENCY,
      symbols: config.MAJOR_CURRENCIES.join()
    }
  };

  let apiResponse;
  try {
    apiResponse = await fetchRates(url, queryOptions);
  } catch (err) {
    throw new Error('Fetching currency rates from fixer');
  }

  let rates = apiResponse.rates;
  for (let [currency,  exchangeRate] of Object.entries(rates)) {
    rates[currency] = 1 / exchangeRate;
  }

  return rates;
}

/**
 * Get latest currency rates from the OANDA currency API quoted against the USD
 */
exports.oandaCurrencyRateAPI = async () => {0
  const url = 'https://www1.oanda.com/rates/api/v2/rates/spot.json'
  const queryParams = {
    params: {
      api_key: env.OANDA_CURRENCY_RATE_API_SECRET,
      base: config.QUOTE_CURRENCY,
      quote: config.MAJOR_CURRENCIES.join()
    }
  }

  let apiResponse
  try {
    apiResponse = await fetchRates(url, queryParams)
  } catch (e) {
    throw new Error('Fetching currency rates from Oanda currency rates API')
  }


  let rates = {};
  apiResponse.quotes.forEach((q) => {
    const exchangeRate = q.bid;
    rates[q.quote_currency] = 1 / exchangeRate;
  })

  return rates;
}


exports.oandaFXAccountRate = async () => {
  const instruments = []
  config.MAJOR_CURRENCIES.forEach((currency) => {
    instruments.push(`${currency}_${config.QUOTE_CURRENCY}`)
  })

  const url = `accounts/${ACCOUNTID}/pricing?instruments=${instruments.join()}`

  let response
  try {
    response = await oandaFXAccountHttp.get(url) 
  } catch (e) {
    console.error('http request to oanda FX account for pricing failed')
    return
  }

  console.log('oanda response >>>>')
  console.log(response)

  let bids = {}
  response.prices.forEach((price) => {
    const currencyAbbrev = price.instrument.substring(0,3);
    const bid = price.bids[0].price;
    bids[currencyAbbrev] = bid
  })

  return bids
}