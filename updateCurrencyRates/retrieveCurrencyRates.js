const axios = require('axios');
const config = require('../config');

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
