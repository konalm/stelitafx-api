const axios = require('axios');
const config = require('../config');

/**
 * Get latest currency rates from the Exchange Rates API quoted against USD
 */
exports.exchangeRatesAPI = async () => {
  const url = 'https://api.exchangeratesapi.io/latest';
  const params = { params: {
    base: config.QUOTE_CURRENCY,
    symbols: config.MAJOR_CURRENCIES.join()
  }};

  let response;
  try {
    response = await axios.get(url, params);
  } catch (err) {
    throw new Error('Getting exchanges rates from exchangeratesapi')
  }

  return response.data.rates;
}
